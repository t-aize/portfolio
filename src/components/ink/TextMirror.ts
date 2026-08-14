import defaultFontUrl from "@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-400-normal.woff?url";
import * as THREE from "three";
import { Text } from "troika-three-text";

export interface TextMirrorOptions {
  /** CSS selector for the DOM elements the ink should recede around. */
  selector?: string;
  /** troika parses font files itself and can only read .ttf/.otf/.woff — not .woff2. */
  font?: string;
}

export interface TextMirrorHandle {
  /** Render this against a target cleared to black — white glyphs on black IS glyph coverage. */
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  /** Re-reads each mirrored element's box, font metrics and text content. */
  resize(cssWidth: number, cssHeight: number): void;
  dispose(): void;
}

interface Entry {
  el: HTMLElement;
  text: Text;
}

function readFontMetrics(el: HTMLElement) {
  const style = getComputedStyle(el);
  const fontSize = Number.parseFloat(style.fontSize) || 16;
  // troika's letterSpacing is an absolute offset in the same unit as
  // fontSize (not em-relative), so the computed px value carries over as-is.
  const letterSpacing =
    style.letterSpacing === "normal" ? 0 : Number.parseFloat(style.letterSpacing) || 0;
  // troika's lineHeight is a multiplier of fontSize, unlike the CSS px value.
  const lineHeightPx =
    style.lineHeight === "normal"
      ? fontSize * 1.2
      : Number.parseFloat(style.lineHeight) || fontSize * 1.2;
  return { fontSize, letterSpacing, lineHeight: lineHeightPx / fontSize };
}

/**
 * Mirrors marked DOM elements as hidden troika Text meshes in their own
 * orthographic scene, one CSS px per world unit. Meant to be rendered into
 * a render target the ink shader reads as a glyph mask — the visible text
 * stays plain server-rendered HTML (see the Stack 3D doc's HTML-first
 * guidance); nothing here is ever drawn to the screen directly.
 */
export function createTextMirror(options: TextMirrorOptions = {}): TextMirrorHandle {
  const font = options.font ?? defaultFontUrl;
  const selector = options.selector ?? "[data-ink-mask]";

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  camera.position.z = 10;
  camera.near = 0.1;
  camera.far = 100;

  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const entries: Entry[] = elements.map((el) => {
    const text = new Text();
    text.font = font;
    text.anchorX = "left";
    text.anchorY = "top";
    text.color = 0xffffff;
    scene.add(text);
    return { el, text };
  });

  function resize(cssWidth: number, cssHeight: number) {
    camera.left = -cssWidth / 2;
    camera.right = cssWidth / 2;
    camera.top = cssHeight / 2;
    camera.bottom = -cssHeight / 2;
    camera.updateProjectionMatrix();

    for (const { el, text } of entries) {
      const rect = el.getBoundingClientRect();
      const metrics = readFontMetrics(el);
      text.text = el.textContent ?? "";
      text.fontSize = metrics.fontSize;
      text.letterSpacing = metrics.letterSpacing;
      text.lineHeight = metrics.lineHeight;
      text.maxWidth = rect.width;
      text.position.set(rect.left - cssWidth / 2, cssHeight / 2 - rect.top, 0);
      text.sync();
    }
  }

  function dispose() {
    for (const { text } of entries) {
      scene.remove(text);
      text.dispose();
    }
    entries.length = 0;
  }

  return { scene, camera, resize, dispose };
}
