import type { VirtualScrollData } from "lenis";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "~/lib/gsap";
import { getLenis, setVirtualScrollHandler } from "~/lib/lenis";
import { scrollStore } from "~/store/scroll";

const EDGE_EPSILON = 0.02;

// Below this, a wheel/touch tick is a trackpad tremor or an accidental
// swipe, not "I meant to scroll" — only deltas past it can trigger the
// snap. A mouse wheel notch clears this easily; a resting thumb on a
// trackpad shouldn't.
const WHEEL_SNAP_THRESHOLD = 6;

// Same three points, two arrangements: collinear (a bar) or spread into
// a wedge (a chevron). MorphSVGPlugin interpolates point-for-point
// between them, so the bar visibly bends open into an arrow instead of
// one icon fading out under another.
const BAR_PATH = "M8,2 L8,8 L8,14";
const CHEVRON_DOWN_PATH = "M2,4 L8,12 L14,4";
const CHEVRON_UP_PATH = "M2,12 L8,4 L14,12";

/**
 * The hero's old vertical title rail, promoted to layout-level: fixed to
 * the right edge, present on every route instead of scrolling away with
 * the hero.
 *
 * The hairline ticks that used to just bracket the label are a bar at
 * rest and morph into a chevron the moment scrolling that way actually
 * goes somewhere — back to a bar once there's nowhere further to go
 * (top of the page, bottom of the page). Driven off scrollStore's
 * Lenis-fed `progress` (see store/scroll.ts), not the hero/projects
 * snap logic below, so it stays correct however many sections the page
 * ends up with.
 *
 * The snap itself goes through Lenis's `virtualScroll` hook (see
 * lib/lenis.ts): while the hero is in view and the wheel/touch gesture
 * points down (or the projects index is right at the top and it points
 * up), this claims the event instead of letting Lenis apply its usual
 * small delta, and animates straight across the seam.
 */
export function ScrollRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const upPathRef = useRef<SVGPathElement>(null);
  const downPathRef = useRef<SVGPathElement>(null);
  const heroVisibleRef = useRef(true);
  const snappingRef = useRef(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        heroVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.5 },
    );
    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  // Bar vs chevron, on each end — purely "is there more this way," read
  // straight off Lenis's scroll progress.
  useEffect(() => {
    const evaluate = () => {
      const { progress } = scrollStore.getState();
      setAtTop(progress <= EDGE_EPSILON);
      setAtBottom(progress >= 1 - EDGE_EPSILON);
    };
    evaluate();
    return scrollStore.subscribe(evaluate);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const snapTo = (target: string) => {
      snappingRef.current = true;
      getLenis()?.scrollTo(target, {
        duration: 1.8,
        lock: true,
        onComplete: () => {
          snappingRef.current = false;
        },
      });
    };

    const handler = (data: VirtualScrollData): boolean => {
      if (snappingRef.current) return true;

      // Scrolling down from the hero — jump straight to the index.
      if (heroVisibleRef.current && data.deltaY > WHEEL_SNAP_THRESHOLD) {
        if (data.event.cancelable) data.event.preventDefault();
        snapTo("#projects");
        return false;
      }

      // Scrolling up from right at the top of the projects list — jump
      // back to the hero. Deep in the list, this stays false and scroll
      // behaves normally: only the seam between the two sections snaps.
      if (!heroVisibleRef.current && data.deltaY < -WHEEL_SNAP_THRESHOLD) {
        const projects = document.getElementById("projects");
        if (projects && projects.getBoundingClientRect().top >= -4) {
          if (data.event.cancelable) data.event.preventDefault();
          snapTo("#hero");
          return false;
        }
      }

      return true;
    };

    setVirtualScrollHandler(handler);
    return () => setVirtualScrollHandler(null);
  }, []);

  // Entrance, roughly where the hero's own timeline used to bring the
  // label in — this rail no longer belongs to that timeline.
  useGSAP(
    () => {
      const rail = railRef.current;
      if (!rail) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(rail, { autoAlpha: 1 });
        return;
      }

      gsap.set(rail, { autoAlpha: 0 });
      gsap.to(rail, { autoAlpha: 1, duration: 1, delay: 0.9, ease: "power2.out" });
    },
    { scope: railRef },
  );

  useEdgeMorph(atTop, upPathRef, CHEVRON_UP_PATH, -4);
  useEdgeMorph(atBottom, downPathRef, CHEVRON_DOWN_PATH, 4);

  const nudge = (el: HTMLButtonElement | null, dy: number) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && el) {
      gsap.fromTo(
        el,
        { y: 0 },
        { y: dy, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" },
      );
    }
  };

  return (
    <div
      ref={railRef}
      className="pointer-events-none fixed inset-y-8 right-8 z-10 hidden flex-col items-center justify-center gap-4 sm:inset-y-16 sm:right-16 sm:flex"
    >
      <button
        type="button"
        aria-label="Revenir en haut"
        disabled={atTop}
        onClick={(e) => {
          nudge(e.currentTarget, -4);
          getLenis()?.scrollTo("#hero", { duration: 1.8 });
        }}
        className="pointer-events-auto flex h-8 w-8 items-center justify-center text-stone transition-colors enabled:hover:text-clay disabled:cursor-default"
      >
        <RailIcon pathRef={upPathRef} />
      </button>

      <span
        aria-hidden="true"
        className="text-xs tracking-[0.4em] text-taupe [writing-mode:vertical-rl]"
      >
        開発者 · PORTFOLIO
      </span>

      <button
        type="button"
        aria-label="Aller aux projets"
        disabled={atBottom}
        onClick={(e) => {
          nudge(e.currentTarget, 4);
          getLenis()?.scrollTo("#projects", { duration: 1.8 });
        }}
        className="pointer-events-auto flex h-8 w-8 items-center justify-center text-stone transition-colors enabled:hover:text-clay disabled:cursor-default"
      >
        <RailIcon pathRef={downPathRef} />
      </button>
    </div>
  );
}

/**
 * Morphs a single path between the bar and the chevron via
 * MorphSVGPlugin — the same three points sliding between collinear and
 * spread, rather than two icons crossfading past each other. A slow
 * idle bounce runs only once it's settled into the chevron.
 */
function useEdgeMorph(
  showBar: boolean,
  pathRef: React.RefObject<SVGPathElement | null>,
  chevronPath: string,
  bounceDy: number,
) {
  const mountedRef = useRef(false);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = showBar ? BAR_PATH : chevronPath;

    if (reduceMotion) {
      gsap.set(path, { morphSVG: target });
      mountedRef.current = true;
      return;
    }

    // Snap into place on mount instead of morphing from nothing.
    if (!mountedRef.current) {
      gsap.set(path, { morphSVG: target });
      mountedRef.current = true;
      return;
    }

    gsap.to(path, { morphSVG: target, duration: 0.7, ease: "power3.inOut" });

    const bounce = showBar
      ? null
      : gsap.to(path, {
          y: bounceDy,
          duration: 1.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.7,
        });

    return () => {
      bounce?.kill();
      gsap.set(path, { y: 0 });
    };
  }, [showBar, pathRef, chevronPath, bounceDy]);
}

function RailIcon({ pathRef }: { pathRef: React.RefObject<SVGPathElement | null> }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <path
        ref={pathRef}
        d={BAR_PATH}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
