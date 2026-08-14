import * as THREE from "three";

export interface RendererHandle {
  renderer: THREE.WebGLRenderer;
  destroy(): void;
}

export interface CreateRendererOptions {
  antialias?: boolean;
  /** Extra recovery logic run after the default preventDefault() on context loss. */
  onContextLost?: () => void;
}

/**
 * Creates the single WebGLRenderer a HeroStage's passes all share. Split out
 * of the old createShaderPass so multiple passes can be composed onto one
 * renderer instead of each pass creating (and fighting over) its own.
 *
 * Returns null if WebGL isn't available at all, before touching the DOM, so
 * the caller can fall back cleanly.
 */
export function createRenderer(
  canvas: HTMLCanvasElement,
  options: CreateRendererOptions = {},
): RendererHandle | null {
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

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    options.onContextLost?.();
  };
  canvas.addEventListener("webglcontextlost", handleContextLost);

  function destroy() {
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    renderer.dispose();
  }

  return { renderer, destroy };
}
