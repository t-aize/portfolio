import * as THREE from "three";
import { createFullscreenPass } from "../createFullscreenPass";
import type { StagePass } from "../HeroStage";
import vertexShader from "../shaders/fullscreen.vert?raw";
import { ACCENT, INK, PAPER } from "../theme";
import fragmentShader from "./shaders/ink.frag?raw";

export interface InkPassHandle {
  uniforms: {
    /**
     * Tween like any other hero element, e.g.:
     *   gsap.to(ink.uniforms.opacity, { value: 1, duration: 1.4 })
     */
    opacity: { value: number };
    /**
     * Assigned by HeroPipeline.ts once maskRT/fieldRT exist — this module
     * builds the shader and its uniform slots, but doesn't own those render
     * targets (see the module doc below), so it can't fill these in itself.
     */
    textMask: { value: THREE.Texture | null };
    textField: { value: THREE.Texture | null };
  };
  /** Registered on a HeroStage by the caller — see HeroPipeline.ts. */
  stagePass: StagePass;
}

/**
 * Builds the ink simulation as a HeroStage pass. Doesn't own a renderer,
 * canvas, or render target itself — HeroPipeline.ts owns the shared stage
 * and the (deliberately capped-resolution) target this renders into, and
 * registers `stagePass` on it. Splitting it this way is what lets the ink
 * pass keep its existing MAX_PIXEL_RATIO tradeoff while the text pass next
 * to it renders at native DPR on the same renderer — see the Netteté
 * section of the hero WebGL mission for why that split exists.
 */
export function createInkPass(): InkPassHandle {
  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uVelocity: { value: 0 },
    uOpacity: { value: 0 },
    uPaper: { value: PAPER },
    uInk: { value: INK },
    uAccent: { value: ACCENT },
    // Filled in by HeroPipeline.ts once maskRT/fieldRT exist; null until
    // then is harmless — nothing renders this pass before that happens.
    uTextMask: { value: null as THREE.Texture | null },
    uTextField: { value: null as THREE.Texture | null },
  };

  const pass = createFullscreenPass({ vertexShader, fragmentShader, uniforms });

  const stagePass: StagePass = {
    pass,
    onFrame: ({ time, scroll }) => {
      uniforms.uTime.value = time;
      uniforms.uVelocity.value = scroll.velocity;
    },
    onResize: (_renderer, cssWidth, cssHeight) => {
      // CSS-space aspect ratio, not the render target's actual pixel size:
      // the fbm frequencies below were tuned against this ratio, and it's
      // identical either way since the target always matches the canvas's
      // aspect ratio regardless of its resolution scale.
      uniforms.uResolution.value.set(cssWidth, cssHeight);
    },
  };

  return {
    uniforms: {
      opacity: uniforms.uOpacity,
      textMask: uniforms.uTextMask,
      textField: uniforms.uTextField,
    },
    stagePass,
  };
}
