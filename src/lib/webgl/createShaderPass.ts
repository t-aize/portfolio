import { gsap } from "gsap";
import * as THREE from "three";
import { onScrollVelocity } from "../scroll-state";

export interface ShaderPassHandle {
  /**
   * Tears down everything this helper set up: the render-loop tick, the
   * resize observer, the context-lost listener, the scroll-velocity
   * subscription, and the material/geometry/renderer. Callers that hold
   * extra state of their own (a texture, a DOM node) should run their own
   * cleanup and then call this.
   */
  destroy(): void;
}

export interface ShaderPassOptions {
  vertexShader: string;
  fragmentShader: string;
  /** Shared by reference with the caller — mutate it directly to drive the shader. */
  uniforms: Record<string, THREE.IUniform>;
  antialias?: boolean;
  /** Element observed for size changes and passed to `onResize`. */
  resizeTarget: HTMLElement;
  /** Called once immediately, then again on every resize of `resizeTarget`. */
  onResize: (renderer: THREE.WebGLRenderer, target: HTMLElement) => void;
  /** Extra recovery logic run after the default `preventDefault()` on context loss. */
  onContextLost?: () => void;
}

/**
 * Mounts a full-viewport shader (a single 2x2 plane seen through an
 * orthographic camera, filling `canvas`) and drives it off GSAP's ticker.
 * This is the renderer/quad/render-loop/velocity/context-loss/teardown
 * boilerplate factored out of `InkScene.ts`, leaving it to supply only
 * what makes it different: its own shaders, uniforms, and resize behavior.
 *

 * Returns null if WebGL isn't available at all, before touching the DOM
 * or scroll-velocity subscriptions, so the caller can fall back cleanly.
 */
export function createShaderPass(
  canvas: HTMLCanvasElement,
  options: ShaderPassOptions,
): ShaderPassHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: options.antialias ?? false,
    });
  } catch {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: options.vertexShader,
    fragmentShader: options.fragmentShader,
    uniforms: options.uniforms,
    transparent: true,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  const resize = () => options.onResize(renderer, options.resizeTarget);
  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(options.resizeTarget);

  const uVelocity = options.uniforms.uVelocity;
  const unsubscribeVelocity = uVelocity
    ? onScrollVelocity((velocity) => {
        uVelocity.value = velocity;
      })
    : null;

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    options.onContextLost?.();
  };
  canvas.addEventListener("webglcontextlost", handleContextLost);

  const uTime = options.uniforms.uTime;
  const tick = (time: number) => {
    if (uTime) uTime.value = time;
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  function destroy() {
    gsap.ticker.remove(tick);
    resizeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    unsubscribeVelocity?.();
    material.dispose();
    quad.geometry.dispose();
    renderer.dispose();
  }

  return { destroy };
}
