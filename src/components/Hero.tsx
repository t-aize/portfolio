"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useScrollReveal } from "~/hooks/use-scroll-reveal";
import { SplitText } from "~/lib/gsap";

// Grid cell size, in CSS px — large enough for the katakana glyph in
// each cell to actually read as a character rather than mush, unlike
// the much finer dot mesh a plain canvas-reveal-effect port would use.
// REVEAL_RADIUS is how far the field reaches from the pointer.
// OPACITY_STEPS mirrors the reference's opacities array (each cell
// rolls one of these on its own cadence) but capped much lower.
const GRID_SIZE = 17;
const FONT_SIZE = 13;
const REVEAL_RADIUS = 190;
const FLICKER_PERIOD = 3;
const OPACITY_STEPS = [0.08, 0.1, 0.14, 0.18, 0.22, 0.26, 0.3, 0.36, 0.42, 0.5];

// Katakana rather than kanji: kanji is already the site's watermark
// device (About, Experience), so a field of individual katakana reads
// as its own thing — closer to a data/terminal texture, fitting for a
// backend dev's hero — instead of repeating that motif a third time.
const KANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// Cheap deterministic pseudo-random per grid cell (same trick the
// reference shader uses: sin() of a scaled coordinate, take the
// fractional part) — no noise library needed for a per-dot seed.
function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/**
 * Composition: a kakemono (hanging scroll). Generous negative space above,
 * the signature ("Tom B.") sits grounded on a plain hairline rule at the
 * bottom, the way a painter signs beneath the picture rather than inside
 * it.
 *
 * Entrance: the name draws itself in char by char, then the rule draws
 * out, the caption settles last. No full-screen gate, just an in-place
 * reveal.
 */
export function Hero() {
  const t = useTranslations();
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // A faint dot grid that only reveals itself within a small radius of
  // the pointer — the same idea as Aceternity's canvas-reveal-effect
  // (a dot field expanding under the cursor), hand-rolled in 2D canvas
  // rather than a WebGL/shader dependency, and kept much fainter. Reads
  // pointer position from a plain ref (not React state) and redraws via
  // rAF, so mouse movement never triggers a re-render. Off entirely on
  // touch (no hover target) and under reduced motion.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduceMotion || !hasFinePointer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const [r, g, b] = hexToRgb(rootStyle.getPropertyValue("--color-ink").trim());
    const fontFamily = rootStyle.getPropertyValue("--font-serif").trim() || "serif";

    ctx.font = `${FONT_SIZE}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const pointer = { x: -1000, y: -1000 };
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);

    let raf = 0;
    const startTime = performance.now();
    const draw = () => {
      const time = (performance.now() - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Only the small box around the pointer is ever iterated, not the
      // full grid — cheap regardless of hero size.
      const startX = Math.floor((pointer.x - REVEAL_RADIUS) / GRID_SIZE) * GRID_SIZE;
      const endX = Math.ceil((pointer.x + REVEAL_RADIUS) / GRID_SIZE) * GRID_SIZE;
      const startY = Math.floor((pointer.y - REVEAL_RADIUS) / GRID_SIZE) * GRID_SIZE;
      const endY = Math.ceil((pointer.y + REVEAL_RADIUS) / GRID_SIZE) * GRID_SIZE;

      for (let x = startX; x <= endX; x += GRID_SIZE) {
        for (let y = startY; y <= endY; y += GRID_SIZE) {
          const dist = Math.hypot(x - pointer.x, y - pointer.y);
          if (dist > REVEAL_RADIUS) continue;

          // Each cell re-rolls its own brightness on its own cadence
          // (offset by a per-cell seed) instead of flickering in
          // lockstep — the "twinkling dot field" the reference shader
          // gets from noise, done here with a hashed time bucket.
          const gx = x / GRID_SIZE;
          const gy = y / GRID_SIZE;
          const seed = hash(gx, gy);
          const bucket = Math.floor(time / FLICKER_PERIOD + seed * 7);
          const roll = hash(gx + bucket * 13.7, gy + bucket * 7.3);
          const level = OPACITY_STEPS[Math.floor(roll * OPACITY_STEPS.length)];

          const falloff = 1 - dist / REVEAL_RADIUS;
          const opacity = level * falloff;

          // Same hashed bucket that picks the opacity also picks which
          // glyph shows, so a cell's character changes each time it
          // re-rolls instead of being fixed forever.
          const charRoll = hash(gx + bucket * 5.9, gy + bucket * 11.3);
          const char = KANA[Math.floor(charRoll * KANA.length)];

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.fillText(char, x, y);
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useScrollReveal({
    scope: containerRef,
    delay: 0.2,
    getSteps: () => {
      const title = titleRef.current;
      const rule = ruleRef.current;
      const subtitle = subtitleRef.current;
      if (!title || !rule || !subtitle) return null;

      // SplitText auto-reverts along with everything else useGSAP
      // creates here, once the component unmounts. No manual
      // titleSplit.revert() needed.
      const titleSplit = new SplitText(title, { type: "chars", mask: "chars" });

      return [
        {
          targets: titleSplit.chars,
          from: { yPercent: 110, autoAlpha: 0 },
          to: { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.04, ease: "expo.out" },
        },
        {
          targets: rule,
          from: { scaleX: 0, transformOrigin: "left center" },
          to: { scaleX: 1, duration: 0.7, ease: "power3.out" },
          position: "-=0.3",
        },
        {
          targets: subtitle,
          from: { autoAlpha: 0, y: 10 },
          to: { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
          position: "-=0.5",
        },
      ];
    },
  });

  return (
    <section
      id="hero"
      ref={containerRef}
      data-snap-section
      className="relative flex min-h-dvh flex-col overflow-hidden px-8 py-10 sm:px-16 sm:py-16"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      <div className="absolute bottom-8 left-8 max-w-md sm:bottom-16 sm:left-16 sm:max-w-xl">
        <h1
          ref={titleRef}
          className="font-serif text-6xl leading-[1.1] font-medium text-ink sm:text-8xl"
        >
          Tom B.
        </h1>

        <div
          ref={ruleRef}
          aria-hidden="true"
          className="mt-6 h-px w-44 origin-left bg-stone sm:mt-8 sm:w-56"
        />

        <p
          ref={subtitleRef}
          className="mt-4 text-xs tracking-[0.3em] text-taupe uppercase sm:text-sm"
        >
          {t("hero.subtitle")}
        </p>
      </div>
    </section>
  );
}
