/**
 * Composed like a hanging scroll (kakemono): a title mark near the top,
 * a deliberately empty field (ma, 間), and the signature resting low —
 * rather than a headline sized to dominate the viewport.
 *
 * The field is no longer empty-by-default: a full-viewport ink shader
 * (see lib/webgl/ink/InkScene.ts) gives it a moving, physical presence —
 * a progressive enhancement, see useHeroEntrance.ts for the
 * reduceMotion/WebGL-availability branch governing what renders when it's
 * unavailable. The name itself stays plain DOM/CSS: a clip-path wipe on
 * entrance and a scroll-velocity-reactive text-shadow fringe, both driven
 * from useHeroEntrance.ts without any canvas involved.
 */
import { useRef } from "react";
import { useHeroEntrance } from "../hooks/useHeroEntrance";

interface HeroProps {
  /** Resolved at build time in index.astro — see the comment there for why. */
  year: number;
}

export default function Hero({ year }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLParagraphElement>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useHeroEntrance({
    hero: heroRef,
    line: lineRef,
    eyebrow: eyebrowRef,
    name: nameRef,
    role: roleRef,
    inkCanvas: inkCanvasRef,
    loader: loaderRef,
  });

  return (
    // `isolate` keeps the ink canvas's negative z-index contained to this section
    <section
      ref={heroRef}
      className="relative isolate flex min-h-svh flex-col gap-[clamp(1.5rem,5vh,3rem)] overflow-hidden bg-paper p-[clamp(1.75rem,6vw,4.5rem)]"
      aria-label="Introduction"
    >
      {/* Ink shader canvas: fills the section, sits behind everything else.
          Starts fully transparent (uOpacity = 0) and is faded in by the
          entrance timeline above, so it reads as ink bleeding into the
          paper rather than a generic fade-in. */}
      <canvas
        ref={inkCanvasRef}
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Loading state: WebGL setup and the document.fonts.ready wait
          above aren't instant, and without this the page just sits there
          looking unfinished for that stretch. Hidden by default (only
          shown once html.js confirms JS is actually running — same
          reasoning as the [data-reveal] rules below, so a blocked script
          never leaves this stuck on screen) and removed once setup
          settles.

          The mark is an ensō (円相) — the single-stroke brush circle drawn
          in Zen practice — rather than a generic spinner, so the loading
          state stays inside the same visual language as the rest of the
          piece. It draws itself, holds, fades, and repeats via the CSS
          animation in global.css; see the `pathLength="1"` trick, which
          lets stroke-dashoffset go 0 -> 1 without computing the path's
          real length by hand. */}
      <div
        ref={loaderRef}
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-paper"
        data-hero-loader
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="h-16 w-16 sm:h-20 sm:w-20" aria-hidden="true">
          <path
            d="M 43.85 15.14 C 47.24 15.46, 58.92 14.07, 64.20 17.07 C 69.49 20.08, 72.15 27.69, 75.57 33.18 C 78.99 38.67, 84.22 44.06, 84.73 50.00 C 85.24 55.94, 82.17 63.60, 78.63 68.83 C 75.10 74.06, 69.36 78.59, 63.54 81.39 C 57.72 84.19, 49.48 87.16, 43.71 85.65 C 37.94 84.14, 33.38 76.98, 28.92 72.35 C 24.46 67.71, 19.03 63.60, 16.95 57.83 C 14.86 52.07, 16.50 41.12, 16.41 37.77"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3.5"
            strokeLinecap="round"
            pathLength="1"
            data-hero-loader-stroke
          />
        </svg>
      </div>

      <div className="flex max-w-[22rem] flex-col gap-3">
        <span
          ref={lineRef}
          className="block h-px w-full origin-left bg-line"
          data-reveal-line
          aria-hidden="true"
        />
        <p
          ref={eyebrowRef}
          className="-my-1 m-0 w-fit rounded-sm bg-paper/70 px-2 py-1 text-xs font-normal tracking-[0.28em] text-ink-soft uppercase backdrop-blur-sm"
          data-reveal
        >
          Portfolio {year}
        </p>
      </div>

      <div className="mt-auto max-w-3xl">
        {/*
          data-reveal-wipe (not data-reveal): hidden via clip-path rather
          than opacity while html.js is set but the entrance timeline
          hasn't run yet — see the matching rule in global.css and the
          clip-path tween in useHeroEntrance.ts.

          The text-shadow fringe grows/shrinks with --velocity, a CSS
          custom property useHeroEntrance.ts writes straight to this
          element on every scroll tick (bypassing React state, since this
          changes every frame and doesn't need a re-render).

          `relative isolate`: the glow span below is an absolutely
          positioned child, so its -z-10 needs a local stacking context on
          the h1 itself, never competing with the ink canvas's own -z-10
          on the section. Sized in `em` (not rem/px) so it scales with the
          h1's own clamp()-based font-size instead of overshooting at
          small viewports or under-covering at large ones.
        */}
        <h1
          ref={nameRef}
          className="relative isolate m-0 text-[clamp(2.75rem,8vw,6rem)] leading-[1.05] font-light tracking-[-0.01em] text-ink"
          style={{
            textShadow:
              "calc(var(--velocity, 0) * 3px) 0 var(--color-accent), calc(var(--velocity, 0) * -3px) 0 var(--color-ink)",
          }}
          data-reveal-wipe
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-[0.12em] -inset-y-[0.06em] -z-10 rounded-full bg-paper/60 blur-[0.08em]"
          />
          Tom B.
        </h1>

        <p
          ref={roleRef}
          className="mt-[0.9rem] mb-0 w-fit rounded-sm bg-paper/70 px-2 py-1 text-sm font-normal tracking-[0.28em] text-ink-soft uppercase backdrop-blur-sm"
          data-reveal
        >
          Développeur &middot; Backend
        </p>
      </div>
    </section>
  );
}
