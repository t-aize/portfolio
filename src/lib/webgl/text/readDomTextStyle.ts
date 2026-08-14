/**
 * Reads exactly the metrics HeroTextPass needs to mirror a DOM text node,
 * from the DOM itself rather than redeclaring them — the h1's font-size is
 * a clamp() that depends on viewport width, so any hardcoded copy would
 * drift out of sync on resize.
 */
export interface DomTextStyle {
  rect: DOMRect;
  text: string;
  fontSize: number; // px
  letterSpacing: number; // px, "normal" -> 0
  lineHeight: number; // px
}

function parsePx(value: string, fallback: number): number {
  if (value === "normal") return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readDomTextStyle(el: HTMLElement): DomTextStyle {
  const style = getComputedStyle(el);
  const fontSize = Number.parseFloat(style.fontSize);
  // getComputedStyle resolves text-transform but not the transformed
  // string itself — troika renders literal glyphs, so apply it ourselves.
  const text =
    style.textTransform === "uppercase"
      ? (el.textContent ?? "").toUpperCase()
      : (el.textContent ?? "");

  return {
    rect: el.getBoundingClientRect(),
    text,
    fontSize,
    letterSpacing: parsePx(style.letterSpacing, 0),
    lineHeight: parsePx(style.lineHeight, fontSize * 1.2),
  };
}
