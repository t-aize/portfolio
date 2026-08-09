import * as THREE from "three";
import { gsap } from "gsap";
import { onScrollVelocity } from "../scroll-state";
import fragmentShader from "./shaders/kinetic.frag?raw";
import vertexShader from "./shaders/kinetic.vert?raw";

export interface KineticTextHandle {
  /**
   * Tween via GSAP for the entrance:
   *   gsap.to(handle.uniforms.reveal, { value: 1, duration: 1.1 })
   */
  uniforms: {
    reveal: { value: number };
  };
  destroy(): void;
}

const MAX_PIXEL_RATIO = 2;

/**
 * Overlays `source` (expected to be a short, single-line headline — this
 * does not handle text wrapping) with a WebGL canvas that repaints the
 * same text as a texture and distorts it by scroll velocity. On success,
 * the source element's own text is set to `color: transparent` so only the
 * canvas is visible — the real text stays in the DOM for accessibility,
 * SEO, and text selection.
 *
 * Returns null if WebGL is unavailable; the caller should leave the
 * source element's text visible and skip the kinetic treatment entirely.
 */
export function createKineticText(source: HTMLElement): KineticTextHandle | null {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null;
  }

  const computedPosition = getComputedStyle(source).position;
  if (computedPosition === "static") {
    source.style.position = "relative";
  }
  source.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTexture: { value: null as THREE.CanvasTexture | null },
    uTime: { value: 0 },
    uVelocity: { value: 0 },
    uReveal: { value: 0 },
    uTexel: { value: new THREE.Vector2(1, 1) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  /** (Re)paints `source`'s text onto an offscreen canvas and swaps the texture in. */
  const repaint = () => {
    const rect = source.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);

    const offscreen = document.createElement("canvas");
    offscreen.width = width * dpr;
    offscreen.height = height * dpr;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const style = getComputedStyle(source);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}/${style.lineHeight} ${style.fontFamily}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#000"; // only the alpha channel is sampled in-shader, color here is irrelevant

    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
    ctx.fillText(source.textContent?.trim() ?? "", 0, lineHeight * 0.8);

    uniforms.uTexture.value?.dispose();
    const texture = new THREE.CanvasTexture(offscreen);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    uniforms.uTexture.value = texture;

    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    // In CSS-pixel terms, not texture-pixel terms — the plane fills the
    // canvas's CSS-pixel viewport 1:1, so this is what keeps the frag
    // shader's halo radius a constant number of screen pixels regardless
    // of devicePixelRatio.
    uniforms.uTexel.value.set(1 / width, 1 / height);
  };
  repaint();

  const resizeObserver = new ResizeObserver(repaint);
  resizeObserver.observe(source);

  const unsubscribeVelocity = onScrollVelocity((velocity) => {
    uniforms.uVelocity.value = velocity;
  });

  // Unlike the ink background, losing the GPU context here would leave the
  // (now transparent) real text invisible — so this one actively recovers
  // by handing text visibility back to the DOM.
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    source.style.color = "";
  };
  canvas.addEventListener("webglcontextlost", handleContextLost);

  const tick = (time: number) => {
    uniforms.uTime.value = time;
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  // Only now — once the canvas is actually painting — do we hide the real
  // glyphs. If anything above had thrown, the source text would simply
  // still be sitting there at full opacity.
  source.style.color = "transparent";

  function destroy() {
    gsap.ticker.remove(tick);
    resizeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    unsubscribeVelocity();
    uniforms.uTexture.value?.dispose();
    material.dispose();
    quad.geometry.dispose();
    renderer.dispose();
    source.style.color = "";
    canvas.remove();
  }

  return {
    uniforms: { reveal: uniforms.uReveal },
    destroy,
  };
}
