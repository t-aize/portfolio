// troika-three-text ships no TypeScript types of its own and there's no
// @types package for it — this declares just the surface HeroTextPass.ts
// actually uses (see node_modules/troika-three-text/src/Text.js for the
// full API this is trimmed from).
declare module "troika-three-text" {
  import type { Mesh } from "three";

  export class Text extends Mesh {
    text: string;
    font: string | null;
    fontSize: number;
    letterSpacing: number;
    lineHeight: number | "normal";
    color: string | number;
    anchorX: number | "left" | "center" | "right";
    anchorY: number | "top" | "top-baseline" | "middle" | "bottom-baseline" | "bottom";
    sdfGlyphSize: number;

    /** Applies pending property changes; `callback` fires once layout is done. */
    sync(callback?: () => void): void;
    dispose(): void;
  }
}
