import * as THREE from "three";

export interface FullscreenPassOptions {
  vertexShader: string;
  fragmentShader: string;
  /** Shared by reference with the caller — mutate it directly to drive the shader. */
  uniforms: Record<string, THREE.IUniform>;
  transparent?: boolean;
}

export interface FullscreenPass {
  uniforms: Record<string, THREE.IUniform>;
  /** Renders to `target`, or to the screen if `target` is null/omitted. */
  render(renderer: THREE.WebGLRenderer, target?: THREE.WebGLRenderTarget | null): void;
  destroy(): void;
}

/**
 * A single full-viewport shader pass: a 2x2 quad in clip space (the vertex
 * shader ignores the camera entirely, so this placeholder orthographic
 * camera is never actually used for projection) with its own material.
 * Owns neither a renderer nor a render loop — HeroStage drives both, so it
 * can interleave several of these per frame.
 */
export function createFullscreenPass(options: FullscreenPassOptions): FullscreenPass {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: options.vertexShader,
    fragmentShader: options.fragmentShader,
    uniforms: options.uniforms,
    transparent: options.transparent ?? true,
    // A fullscreen quad has no meaningful position in 3D — it must never
    // read or write the depth buffer, or it can occlude (or be occluded by)
    // a later pass sharing the same target (e.g. the text pass drawn after
    // the ink composite onto the same screen framebuffer).
    depthTest: false,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  function render(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null = null) {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  }

  function destroy() {
    material.dispose();
    quad.geometry.dispose();
  }

  return { uniforms: options.uniforms, render, destroy };
}
