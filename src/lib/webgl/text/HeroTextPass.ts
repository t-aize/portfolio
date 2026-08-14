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
  stagePass: StagePass;
  /** Resolves once every Text has laid out at least once. */
  ready: Promise<void>;
  destroy(): void;
}

// Calibrated so 1 world unit = 1 CSS px at z = 0 (see syncCamera below) —
// arbitrary otherwise, just needs to be far enough that the resulting fov
// stays in a sane range.
const CAMERA_DISTANCE = 600;

/**
 * Mirrors a set of DOM text nodes as troika Text meshes, positioned from
 * their getBoundingClientRect() through a PerspectiveCamera calibrated so
 * world units equal CSS pixels. Registered as a HeroStage pass by
 * HeroPipeline.ts, rendered last (on top of the ink composite).
 */
export function createHeroTextPass(targets: HeroTextTarget[]): HeroTextPassHandle {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, CAMERA_DISTANCE);
  camera.lookAt(0, 0, 0);

  const texts = targets.map(({ el, font, color, sdfGlyphSize }) => {
    const text = new Text();
    text.font = font;
    text.color = color;
    text.anchorX = "left";
    text.anchorY = "middle";
    if (sdfGlyphSize) text.sdfGlyphSize = sdfGlyphSize;
    scene.add(text);
    return { el, text };
  });

  function layout() {
    for (const { el, text } of texts) {
      const style = readDomTextStyle(el);
      text.text = style.text;
      text.fontSize = style.fontSize;
      text.letterSpacing = style.letterSpacing;
      text.lineHeight = style.lineHeight / style.fontSize;
    }
  }

  function syncPositions(cssWidth: number, cssHeight: number) {
    for (const { el, text } of texts) {
      const rect = el.getBoundingClientRect();
      text.position.set(rect.left - cssWidth / 2, cssHeight / 2 - (rect.top + rect.height / 2), 0);
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
      ...texts.map(({ text }) => new Promise<void>((resolveOne) => text.sync(resolveOne))),
    ]).then(() => resolve());
  });

  const stagePass: StagePass = {
    // No `target`/`clear: false` here — set by HeroPipeline.ts, which owns
    // pass ordering (this must draw after the ink composite writes the
    // screen target, without wiping it).
    pass: {
      render(renderer) {
        renderer.render(scene, camera);
      },
      destroy() {
        for (const { text } of texts) text.dispose();
      },
    },
    onResize: (_renderer, cssWidth, cssHeight) => {
      // Re-reads layout (not just position) on resize: the h1's font-size
      // is a clamp() tied to viewport width, so fontSize/letterSpacing
      // themselves change, not just the box they sit in.
      layout();
      syncCamera(cssWidth, cssHeight);
      syncPositions(cssWidth, cssHeight);
    },
  };

  return { stagePass, ready, destroy: stagePass.pass.destroy };
}
