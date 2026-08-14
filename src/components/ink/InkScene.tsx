import { useGSAP } from "@gsap/react";
import { shaderMaterial, useFBO } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { damp } from "maath/easing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "~/lib/gsap";
import { createFullscreenPass } from "~/lib/webgl/fullscreenPass";
import { ACCENT, INK, PAPER } from "~/lib/webgl/theme";
import { scrollStore } from "~/store/scroll";
import blurFragmentShader from "./shaders/blur.frag?raw";
import fullscreenVertexShader from "./shaders/fullscreen.vert?raw";
import inkFragmentShader from "./shaders/ink.frag?raw";
import { createTextMirror } from "./TextMirror";

// fieldTarget (and the temp buffer feeding its second blur pass) render at
// a quarter of the mask's resolution — the blurred field only needs to
// describe a soft falloff around each glyph, not preserve detail, and the
// downsampling itself is most of what gives two 9-tap blur passes their reach.
const FIELD_DOWNSAMPLE = 4;

// Lenis scroll velocity has no fixed ceiling; this is the raw magnitude
// treated as "full speed" when normalizing it into the shader's 0..1 uVelocity.
const VELOCITY_NORMALIZE = 50;

// Generous exponential smoothing: raw scroll velocity spikes hard on a
// single trackpad flick, and must also decay back to 0 on its own once
// scrolling stops. damp() does both for free — the target becomes 0 at
// rest and it eases toward it, no separate reset logic needed.
const VELOCITY_SMOOTH_TIME = 0.5;

const RED_BUFFER = {
  format: THREE.RedFormat,
  type: THREE.UnsignedByteType,
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
};

// drei's shaderMaterial gives each uniform a plain property getter/setter
// (material.uTime = x) instead of material.uniforms.uTime.value = x, and
// GSAP can tween those properties directly like any other object.
const BlurMaterial = shaderMaterial(
  {
    uSource: null as THREE.Texture | null,
    uTexelSize: new THREE.Vector2(1, 1),
    uDirection: new THREE.Vector2(1, 0),
  },
  fullscreenVertexShader,
  blurFragmentShader,
);

const InkMaterial = shaderMaterial(
  {
    uResolution: new THREE.Vector2(1, 1),
    uTime: 0,
    uVelocity: 0,
    uOpacity: 0,
    uPaper: PAPER,
    uInk: INK,
    uAccent: ACCENT,
    uTextMask: null as THREE.Texture | null,
    uTextField: null as THREE.Texture | null,
  },
  fullscreenVertexShader,
  inkFragmentShader,
);

export interface InkSceneProps {
  /** CSS selector for the DOM elements the ink should recede around. */
  selector?: string;
}

/**
 * Owns the whole ink pipeline for one frame: mirror the marked DOM text into
 * a glyph mask, blur it into a soft field, then run the fbm/curl ink
 * simulation against both. Runs as a single manually-driven render pass
 * (see the render-priority useFrame below) so mask -> blur -> blur -> ink
 * happens in a fixed order every frame, ahead of R3F's own default render.
 */
export function InkScene({ selector }: InkSceneProps) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const fullW = Math.max(1, Math.round(size.width * dpr));
  const fullH = Math.max(1, Math.round(size.height * dpr));
  const fieldW = Math.max(1, Math.round(fullW / FIELD_DOWNSAMPLE));
  const fieldH = Math.max(1, Math.round(fullH / FIELD_DOWNSAMPLE));

  // useFBO owns creation, resize (via setSize when width/height change) and
  // disposal of each render target — no manual bookkeeping needed here.
  const maskTarget = useFBO(fullW, fullH, RED_BUFFER);
  const blurTempTarget = useFBO(fieldW, fieldH, RED_BUFFER);
  const fieldTarget = useFBO(fieldW, fieldH, RED_BUFFER);

  const [textMirror] = useState(() => createTextMirror({ selector }));
  const [blurH] = useState(() =>
    createFullscreenPass(new BlurMaterial({ depthTest: false, depthWrite: false })),
  );
  const [blurV] = useState(() =>
    createFullscreenPass(new BlurMaterial({ depthTest: false, depthWrite: false })),
  );
  const [inkMaterial] = useState(
    () => new InkMaterial({ depthTest: false, depthWrite: false, transparent: true }),
  );

  // This component only re-renders when `size`/`dpr` actually change (a
  // real resize) — useFrame below runs outside React's render cycle, so it
  // never re-triggers this. Wiring resize-derived uniforms directly in the
  // body, rather than in an effect, is cheap and keeps them trivially in
  // sync with the values computed above.
  blurH.material.uSource = maskTarget.texture;
  blurH.material.uDirection.set(1, 0);
  blurH.material.uTexelSize.set(1 / fullW, 1 / fullH);
  blurV.material.uSource = blurTempTarget.texture;
  blurV.material.uDirection.set(0, 1);
  blurV.material.uTexelSize.set(1 / fieldW, 1 / fieldH);
  inkMaterial.uResolution.set(size.width, size.height);
  inkMaterial.uTextMask = maskTarget.texture;
  inkMaterial.uTextField = fieldTarget.texture;

  // Mirrored text boxes involve real DOM reads and an async troika sync —
  // kept in an effect so it runs once per resize, not on every render pass.
  useEffect(() => {
    textMirror.resize(size.width, size.height);
  }, [size, textMirror]);

  useEffect(
    () => () => {
      blurH.dispose();
      blurV.dispose();
      inkMaterial.dispose();
      textMirror.dispose();
    },
    [blurH, blurV, inkMaterial, textMirror],
  );

  // Ink rises from zero over 1.4s, decelerating only — no bounce/elastic —
  // while the rest of the page settles in around it, not before or after.
  useGSAP(() => {
    gsap.to(inkMaterial, { uOpacity: 1, duration: 1.4, ease: "power2.out" });
  }, [inkMaterial]);

  // Real elapsed time since mount, read fresh every frame — not
  // accumulated from per-frame deltas — so a stalled/backgrounded tab
  // never needs to "catch up": the next frame just reflects however much
  // wall-clock time actually passed.
  const startTime = useRef(performance.now());
  const smoothedVelocity = useRef(0);

  useFrame((state, delta) => {
    const { gl: renderer, scene, camera } = state;

    inkMaterial.uTime = (performance.now() - startTime.current) / 1000;

    const rawVelocity = Math.min(Math.abs(scrollStore.getState().velocity) / VELOCITY_NORMALIZE, 1);
    damp(smoothedVelocity, "current", rawVelocity, VELOCITY_SMOOTH_TIME, delta);
    inkMaterial.uVelocity = smoothedVelocity.current;

    renderer.setRenderTarget(maskTarget);
    renderer.render(textMirror.scene, textMirror.camera);

    blurH.render(renderer, blurTempTarget);
    blurV.render(renderer, fieldTarget);

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }, 1);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={inkMaterial} attach="material" />
    </mesh>
  );
}
