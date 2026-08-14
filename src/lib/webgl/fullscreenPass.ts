import * as THREE from "three";

/**
 * A single full-viewport shader pass: a 2x2 quad in clip space, rendered
 * into an arbitrary target (or the screen). The vertex shader it's paired
 * with (fullscreen.vert) writes clip-space positions directly, so the
 * camera here exists only because renderer.render() requires one — it
 * never actually projects anything.
 */
export function createFullscreenPass<Material extends THREE.ShaderMaterial>(material: Material) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  function render(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null) {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  }

  function dispose() {
    material.dispose();
    quad.geometry.dispose();
  }

  return { material, render, dispose };
}
