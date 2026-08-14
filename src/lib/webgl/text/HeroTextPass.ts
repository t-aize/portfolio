import * as THREE from "three";
import { Text } from "troika-three-text";
import type { StagePass } from "../HeroStage";
import { readDomTextStyle } from "./readDomTextStyle";

export interface HeroTextTarget {
  /** The [data-webgl-text] node this Text mirrors. */
  el: HTMLElement;
  /** Path to a .ttf/.woff — troika parses the font itself and can't read woff2. */
  font: string;
  color: string;
  /** Bumped for the h1: troika's default SDF resolution reads soft at 6rem. */
  sdfGlyphSize?: number;
}

export interface HeroTextPassHandle {
  /** Draws the visible glyphs, in `color`. Register on the screen target, last. */
  display: StagePass;
  /**
   * Draws the same glyphs in troika's default white, same font/size/position
   * as `display` — meant for a target cleared to black. Left at troika's
   * default color/material (transparent: true, SDF edge alpha) rather than
   * a dedicated shader: white blended over black IS the glyph coverage
   * value, so the render target's red channel is exactly the mask
   * ink.frag needs, with SDF antialiasing already baked into the edges.
   * Register on maskRT, before the blur/ink passes that consume it.
   */
  mask: StagePass;
  /** Resolves once every Text (both scenes) has laid out at least once. */
  ready: Promise<void>;
  /**
   * Makes the display glyphs visible. They start hidden (`visible = false`)
   * so the pass can exist — and the mask can already be reacting with the
   * ink — before the DOM's own entrance wipe has finished; see
   * useHeroEntrance.ts, which calls this at the exact moment the wipe
   * completes so the DOM->WebGL handoff has no visible seam. Only affects
   * `display`; `mask` is never hidden.
   */
  revealDisplay(): void;
}

// Calibrated so 1 world unit = 1 CSS px at z = 0 (see syncCamera below) —
// arbitrary otherwise, just needs to be far enough that the resulting fov
// stays in a sane range.
const CAMERA_DISTANCE = 600;

/**
 * Mirrors a set of DOM text nodes as troika Text meshes, positioned from
 * their getBoundingClientRect() through a PerspectiveCamera calibrated so
 * world units equal CSS pixels. Builds two parallel Text instances per
 * target (display + mask) sharing one camera and one layout pass, since
 * three.js meshes can only belong to one scene each.
 */
export function createHeroTextPass(targets: HeroTextTarget[]): HeroTextPassHandle {
  const displayScene = new THREE.Scene();
  const maskScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, CAMERA_DISTANCE);
  camera.lookAt(0, 0, 0);

  function makeText(font: string, sdfGlyphSize: number | undefined): Text {
    const text = new Text();
    text.font = font;
    text.anchorX = "left";
    text.anchorY = "middle";
    if (sdfGlyphSize) text.sdfGlyphSize = sdfGlyphSize;
    return text;
  }

  const entries = targets.map(({ el, font, color, sdfGlyphSize }) => {
    const display = makeText(font, sdfGlyphSize);
    display.color = color;
    display.visible = false;
    displayScene.add(display);

    // Color intentionally left unset (troika defaults to white).
    const mask = makeText(font, sdfGlyphSize);
    maskScene.add(mask);

    return { el, display, mask };
  });

  function layout() {
    for (const { el, display, mask } of entries) {
      const style = readDomTextStyle(el);
      for (const text of [display, mask]) {
        text.text = style.text;
        text.fontSize = style.fontSize;
        text.letterSpacing = style.letterSpacing;
        text.lineHeight = style.lineHeight / style.fontSize;
      }
    }
  }

  function syncPositions(cssWidth: number, cssHeight: number) {
    for (const { el, display, mask } of entries) {
      const rect = el.getBoundingClientRect();
      const x = rect.left - cssWidth / 2;
      const y = cssHeight / 2 - (rect.top + rect.height / 2);
      display.position.set(x, y, 0);
      mask.position.set(x, y, 0);
    }
  }

  function syncCamera(cssWidth: number, cssHeight: number) {
    camera.fov = 2 * Math.atan(cssHeight / 2 / CAMERA_DISTANCE) * (180 / Math.PI);
    camera.aspect = cssWidth / cssHeight;
    camera.updateProjectionMatrix();
  }

  const ready = new Promise<void>((resolve) => {
    layout();
    Promise.all([
      document.fonts.ready,
      ...entries.flatMap(({ display, mask }) => [
        new Promise<void>((r) => display.sync(r)),
        new Promise<void>((r) => mask.sync(r)),
      ]),
    ]).then(() => resolve());
  });

  const display: StagePass = {
    pass: {
      render(renderer) {
        renderer.render(displayScene, camera);
      },
      destroy() {
        for (const { display } of entries) display.dispose();
      },
    },
    onResize: (_renderer, cssWidth, cssHeight) => {
      // Re-reads layout (not just position) on resize: the h1's font-size
      // is a clamp() tied to viewport width, so fontSize/letterSpacing
      // themselves change, not just the box they sit in. Also drives the
      // shared camera — mask's own onResize doesn't need to repeat this.
      layout();
      syncCamera(cssWidth, cssHeight);
      syncPositions(cssWidth, cssHeight);
    },
  };

  const mask: StagePass = {
    pass: {
      render(renderer) {
        renderer.render(maskScene, camera);
      },
      destroy() {
        for (const { mask } of entries) mask.dispose();
      },
    },
  };

  function revealDisplay() {
    for (const { display } of entries) display.visible = true;
  }

  return { display, mask, ready, revealDisplay };
}
