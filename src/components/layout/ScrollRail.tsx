import type { VirtualScrollData } from "lenis";
import { useEffect, useRef, useState } from "react";
import { dictionaries, type Lang } from "~/i18n/dictionaries";
import { gsap, useGSAP } from "~/lib/gsap";
import { getLenis, SCROLL_DURATION, setVirtualScrollHandler } from "~/lib/lenis";
import { scrollStore } from "~/store/scroll";

const EDGE_EPSILON = 0.02;

// Below this, a wheel/touch tick is a trackpad tremor or an accidental
// swipe, not "I meant to scroll". Only deltas past it can trigger the
// snap. Set high enough that a light or hesitant scroll passes through as
// normal scrolling instead of firing the snap.
const WHEEL_SNAP_THRESHOLD = 12;

// How close a section's top edge has to sit to the viewport's top edge
// (in px) to count as "currently filling the screen," and so a valid snap
// origin. Slack for sub-pixel layout and Lenis's own settle jitter.
const SNAP_EDGE_EPSILON = 24;

// Same three points, two arrangements: collinear (a bar) or spread into
// a wedge (a chevron). MorphSVGPlugin interpolates point-for-point
// between them, so the bar visibly bends open into an arrow instead of
// one icon fading out under another.
const BAR_PATH = "M8,2 L8,8 L8,14";
const CHEVRON_DOWN_PATH = "M2,4 L8,12 L14,4";
const CHEVRON_UP_PATH = "M2,12 L8,4 L14,12";

// The first snap section still ahead of the current scroll position, used
// by the rail's "down" button, which (unlike the wheel/touch snap) can be
// clicked from anywhere, not just from a section that's exactly
// top-aligned right now.
function getNextSectionId(): string | undefined {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-snap-section]"));
  return sections.find((el) => el.getBoundingClientRect().top > SNAP_EDGE_EPSILON)?.id;
}

/**
 * The hero's old vertical title rail, promoted to layout-level: fixed to
 * the right edge, present on every route instead of scrolling away with
 * the hero.
 *
 * The hairline ticks that used to just bracket the label are a bar at
 * rest and morph into a chevron the moment scrolling that way actually
 * goes somewhere, back to a bar once there's nowhere further to go
 * (top of the page, bottom of the page). Driven off scrollStore's
 * Lenis-fed `progress` (see store/scroll.ts), not the snap logic below,
 * so it stays correct however many sections the page ends up with.
 *
 * The snap itself goes through Lenis's `virtualScroll` hook (see
 * lib/lenis.ts): every section marked `data-snap-section` is exactly one
 * viewport tall, so whichever one currently fills the screen from the top
 * is a valid snap origin in both directions. A wheel/touch tick from
 * there claims the event instead of letting Lenis apply its usual small
 * delta, and animates straight to the next (or previous) one. Sections
 * opt in by adding the attribute; nothing here needs to change as more
 * get added.
 */
export function ScrollRail({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const railRef = useRef<HTMLDivElement>(null);
  const upPathRef = useRef<SVGPathElement>(null);
  const downPathRef = useRef<SVGPathElement>(null);
  const snappingRef = useRef(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  // Bar vs chevron, on each end: purely "is there more this way," read
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

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-snap-section]"));
    if (sections.length === 0) return;

    const snapTo = (target: string) => {
      snappingRef.current = true;
      getLenis()?.scrollTo(target, {
        duration: SCROLL_DURATION,
        lock: true,
        onComplete: () => {
          snappingRef.current = false;
        },
      });
    };

    // The one section (if any) currently filling the screen from the very
    // top, as opposed to one we're mid-scroll through, or one only
    // partially in view. Since every snap section is exactly one viewport
    // tall and they're stacked with no gaps, this is a valid snap origin
    // in both directions: a wheel tick from here always lands cleanly on
    // the next or previous section boundary.
    const findCurrentIndex = (): number =>
      sections.findIndex((el) => {
        const top = el.getBoundingClientRect().top;
        return top >= -SNAP_EDGE_EPSILON && top <= SNAP_EDGE_EPSILON;
      });

    const handler = (data: VirtualScrollData): boolean => {
      if (snappingRef.current) return true;

      const index = findCurrentIndex();
      if (index === -1) return true;

      if (data.deltaY > WHEEL_SNAP_THRESHOLD) {
        const next = sections[index + 1];
        if (!next) return true; // last section: let normal scroll continue into the footer
        if (data.event.cancelable) data.event.preventDefault();
        snapTo(`#${next.id}`);
        return false;
      }

      if (data.deltaY < -WHEEL_SNAP_THRESHOLD) {
        const prev = sections[index - 1];
        if (!prev) return true; // first section: nothing above to snap to
        if (data.event.cancelable) data.event.preventDefault();
        snapTo(`#${prev.id}`);
        return false;
      }

      return true;
    };

    setVirtualScrollHandler(handler);
    return () => setVirtualScrollHandler(null);
  }, []);

  // Entrance, roughly where the hero's own timeline used to bring the
  // label in. This rail no longer belongs to that timeline.
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
        aria-label={t.rail.up}
        disabled={atTop}
        onClick={(e) => {
          nudge(e.currentTarget, -4);
          getLenis()?.scrollTo("#hero", { duration: SCROLL_DURATION });
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
        aria-label={t.rail.down}
        disabled={atBottom}
        onClick={(e) => {
          nudge(e.currentTarget, 4);
          const next = getNextSectionId();
          getLenis()?.scrollTo(next ? `#${next}` : "#about", { duration: SCROLL_DURATION });
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
 * MorphSVGPlugin: the same three points sliding between collinear and
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
