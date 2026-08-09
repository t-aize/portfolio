import * as THREE from "three";
import { createShaderPass } from "../createShaderPass";
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

const MAX_PIXEL_RATIO = 1.75; // full-screen fbm at native DPR isn't worth the battery cost

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
  // (No onContextLost handler needed: the default preventDefault() is enough.)
  const pass = createShaderPass(canvas, {
    vertexShader,
    fragmentShader,
    uniforms,
    resizeTarget: host,
    onResize: (renderer, target) => {
      const { clientWidth, clientHeight } = target;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
      renderer.setSize(clientWidth, clientHeight, false);
      uniforms.uResolution.value.set(clientWidth, clientHeight);
    },
  });

  if (!pass) return null;

  return {
    uniforms: { opacity: uniforms.uOpacity },
    destroy: pass.destroy,
  };
}
