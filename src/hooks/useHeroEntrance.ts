/**
 * Owns the hero's entrance sequence — the ink background and the GSAP
 * reveal timeline (line, eyebrow, name wipe, role). This used to live as a
 * plain script (scripts/hero.ts) that ran once against the DOM; now it's a
 * hook so Hero.tsx can stay markup-only and this file can own the
 * WebGL/GSAP orchestration on its own.
 */
import { gsap } from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";
import type { HeroPipelineHandle } from "../lib/webgl/HeroPipeline";
import type { HeroTextTarget } from "../lib/webgl/text/HeroTextPass";

// troika-three-text parses font files itself and can't read woff2, so it
// can't use @fontsource's files directly even though they're the same
// family/weights already loaded for the DOM text. These are a Latin-only
// subset (~30KB each) of Zen Kaku Gothic New's unhinted source, built once
// with hb-subset and checked in as static assets — not re-derived at build
// time, since it's a one-off asset prep step, not a build step.
const FONT_LIGHT = "/fonts/zen-kaku-gothic-new-latin-300.ttf";
const FONT_REGULAR = "/fonts/zen-kaku-gothic-new-latin-400.ttf";

export interface HeroRefs {
  hero: RefObject<HTMLElement | null>;
  line: RefObject<HTMLSpanElement | null>;
  eyebrow: RefObject<HTMLParagraphElement | null>;
  name: RefObject<HTMLHeadingElement | null>;
  role: RefObject<HTMLParagraphElement | null>;
  inkCanvas: RefObject<HTMLCanvasElement | null>;
  loader: RefObject<HTMLDivElement | null>;
}

/**
 * Awaits `load()` (a dynamic import plus whatever setup it needs), then
 * either hands back the resulting handle or — if `isCancelled()` went true
 * while we were waiting — destroys it immediately and hands back null.
 * The ink scene needs this: React can unmount the hero mid-await
 * (StrictMode, fast navigation), and a scene finishing setup after its own
 * cleanup already ran would leak a WebGL context.
 */
async function createGuarded<T extends { destroy(): void }>(
  load: () => Promise<T | null>,
  isCancelled: () => boolean,
): Promise<T | null> {
  const handle = await load();
  if (isCancelled()) {
    handle?.destroy();
    return null;
  }
  return handle;
}

export function useHeroEntrance(refs: HeroRefs): void {
  // Refs are stable for the lifetime of the component (useRef never returns
  // a new object), so this is correctly a mount-only effect — it doesn't
  // need to re-run when any ref's `.current` changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: refs are stable, see comment above
  useEffect(() => {
    const hero = refs.hero.current;
    if (!hero) return;

    const line = refs.line.current;
    const eyebrow = refs.eyebrow.current;
    const name = refs.name.current;
    const role = refs.role.current;
    const inkCanvas = refs.inkCanvas.current;
    const loader = refs.loader.current;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let pipeline: HeroPipelineHandle | null = null;
    let unsubscribeVelocity: (() => void) | null = null;
    let tl: gsap.core.Timeline | null = null;

    async function run(hero: HTMLElement) {
      // --- Scroll-reactive name fringe --------------------------------
      // Dynamic import, not static: this module chain reaches lenis.ts,
      // which touches `window` at module-eval time. Hero.tsx is server-
      // rendered by Astro even under client:load, so a static import here
      // would blow up during SSR — deferring it into this effect-only
      // async flow keeps it client-side only, same reasoning as the WebGL
      // pipeline import below.
      if (!reduceMotion && name) {
        const { onScrollVelocity } = await import("../lib/scroll-state");
        if (cancelled) return;
        unsubscribeVelocity = onScrollVelocity((velocity) => {
          name.style.setProperty("--velocity", String(velocity));
        });
      }

      // --- Ink background + WebGL text mirror --------------------------
      if (!reduceMotion && inkCanvas) {
        pipeline = await createGuarded(
          async () => {
            const [{ createHeroPipeline }, { INK_HEX, INK_SOFT_HEX }] = await Promise.all([
              import("../lib/webgl/HeroPipeline"),
              import("../lib/webgl/theme"),
            ]);

            const textTargets: HeroTextTarget[] = [];
            if (eyebrow) textTargets.push({ el: eyebrow, font: FONT_REGULAR, color: INK_SOFT_HEX });
            if (name) {
              textTargets.push({ el: name, font: FONT_LIGHT, color: INK_HEX, sdfGlyphSize: 256 });
            }
            if (role) textTargets.push({ el: role, font: FONT_REGULAR, color: INK_SOFT_HEX });

            return createHeroPipeline(inkCanvas, hero, textTargets);
          },
          () => cancelled,
        );
        if (cancelled) return;

        if (pipeline) {
          // Gate on document.fonts.ready + every Text's own sync(), not
          // just pipeline construction: that only proves the WebGLRenderer
          // exists, not that glyphs have actually laid out yet. Flipping
          // the DOM to transparent before that would blank the text with
          // nothing yet drawn in its place.
          await pipeline.textReady;
          if (cancelled) {
            pipeline.destroy();
            return;
          }
          hero.dataset.webglTextReady = "true";
        }
      }

      // Hide the loading state now that WebGL + text setup (if any) has
      // settled. For reduced motion this fires essentially immediately,
      // since that branch never creates the pipeline above.
      if (loader) {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => loader.remove(),
        });
      }

      if (reduceMotion) {
        // `clearProps` only removes inline styles GSAP itself set — nothing
        // has run yet in this branch, so it would leave the CSS-hidden
        // state (html.js [data-reveal] { opacity: 0 }, [data-reveal-wipe]'s
        // clip-path) in place forever. Set the final values explicitly
        // instead so they actually override it.
        if (line) gsap.set(line, { scaleX: 1 });
        gsap.set([eyebrow, role].filter(Boolean), { opacity: 1 });
        if (name) gsap.set(name, { clipPath: "inset(0% 0% 0% 0%)" });
        // Ink scene is skipped entirely above for reduced motion, so the
        // real <h1> just renders normally — no extra work needed there.
      } else {
        tl = gsap.timeline({ delay: 0.2, defaults: { ease: "power3.out" } });

        tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }).fromTo(
          eyebrow,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.55",
        );

        if (pipeline) {
          tl.to(pipeline.ink.opacity, { value: 1, duration: 1.4, ease: "power2.out" }, "-=0.5");
        }

        if (name) {
          // Left-to-right wipe, like a brush stroke laying the name down —
          // plain clip-path on the real text, no canvas involved.
          tl.fromTo(
            name,
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.out" },
            "-=0.9",
          );
        }

        tl.fromTo(role, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.55");
      }
    }

    void run(hero);

    return () => {
      cancelled = true;
      tl?.kill();
      unsubscribeVelocity?.();
      pipeline?.destroy();
    };
  }, []);
}
