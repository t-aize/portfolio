import * as THREE from "three";
import { gsap } from "gsap";
import { onScrollVelocity } from "../scroll-state";
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
export function createInkScene(canvas: HTMLCanvasElement, host: HTMLElement): InkSceneHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uVelocity: { value: 0 },
    uOpacity: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  const resize = () => {
    const { clientWidth, clientHeight } = host;
    if (clientWidth === 0 || clientHeight === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(clientWidth, clientHeight, false);
    uniforms.uResolution.value.set(clientWidth, clientHeight);
  };
  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const unsubscribeVelocity = onScrollVelocity((velocity) => {
    uniforms.uVelocity.value = velocity;
  });

  // If the GPU context dies mid-session the canvas just freezes on its last
  // frame — harmless here since it's a purely decorative background layer,
  // unlike the kinetic text canvas which would take real content with it.
  const handleContextLost = (event: Event) => event.preventDefault();
  canvas.addEventListener("webglcontextlost", handleContextLost);

  // Driven by GSAP's ticker rather than its own requestAnimationFrame loop —
  // same reasoning as lenis.ts: one shared clock so scroll, camera and
  // shader time can never drift apart under a stalled tab.
  const tick = (time: number) => {
    uniforms.uTime.value = time;
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  function destroy() {
    gsap.ticker.remove(tick);
    resizeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    unsubscribeVelocity();
    material.dispose();
    quad.geometry.dispose();
    renderer.dispose();
  }

  return {
    uniforms: { opacity: uniforms.uOpacity },
    destroy,
  };
}
