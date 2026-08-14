import * as THREE from "three";
import { createFullscreenPass } from "../createFullscreenPass";
import { createHeroStage } from "../HeroStage";
import { ACCENT, INK, PAPER } from "../theme";
import fragmentShader from "./shaders/ink.frag?raw";
import vertexShader from "./shaders/ink.vert?raw";

export interface InkSceneHandle {
  /**
   * Tween these exactly like any other hero element, e.g.:
   *   gsap.to(scene.uniforms.opacity, { value: 1, duration: 1.4 })
   */
  uniforms: {
    opacity: { value: number };
  };
  destroy(): void;
}

// Full-screen fbm at native DPR isn't worth the battery cost. Passed into
// HeroStage as its pixel ratio policy: this scene has no text pass yet to
// justify going native (that lands with HeroTextPass — see the Netteté
// requirements in the hero WebGL mission), so it keeps the existing cap.
const MAX_PIXEL_RATIO = 1.75;

/**
 * Mounts a full-viewport (within `host`) ink simulation onto `canvas`.
 * Returns null if WebGL isn't available at all, so the caller can fall
 * back to the static CSS halo instead of a broken canvas.
 */
export function createInkScene(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
): InkSceneHandle | null {
  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uVelocity: { value: 0 },
    uOpacity: { value: 0 },
    uPaper: { value: PAPER },
    uInk: { value: INK },
    uAccent: { value: ACCENT },
  };

  // If the GPU context dies mid-session the canvas just freezes on its last
  // frame — harmless here since it's a purely decorative background layer.
  const stage = createHeroStage(canvas, host, {
    getPixelRatio: () => Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO),
  });
  if (!stage) return null;

  const pass = createFullscreenPass({ vertexShader, fragmentShader, uniforms });

  stage.addPass({
    pass,
    onFrame: ({ time, scroll }) => {
      uniforms.uTime.value = time;
      uniforms.uVelocity.value = scroll.velocity;
    },
    onResize: (_renderer, cssWidth, cssHeight) => {
      uniforms.uResolution.value.set(cssWidth, cssHeight);
    },
  });

  return {
    uniforms: { opacity: uniforms.uOpacity },
    destroy: stage.destroy,
  };
}
