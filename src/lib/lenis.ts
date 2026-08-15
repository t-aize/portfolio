import type { VirtualScrollData } from "lenis";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "~/lib/gsap";
import { scrollStore } from "~/store/scroll";

let lenis: Lenis | null = null;

// Pluggable, set by whoever wants to intercept a wheel/touch tick before
// Lenis turns it into a scroll delta, e.g. ScrollRail's hero→projects
// snap. Returning false from this tells Lenis "I've handled this one."
// Lives outside the Lenis instance because the instance is a singleton
// built once, while the handler depends on what's currently mounted.
let virtualScrollHandler: ((data: VirtualScrollData) => boolean) | null = null;

export function setVirtualScrollHandler(
  handler: ((data: VirtualScrollData) => boolean) | null,
): void {
  virtualScrollHandler = handler;
}

/**
 * Module singleton so Lenis survives route changes instead of being
 * remounted with a component. `autoRaf: false` because GSAP's ticker
 * already runs a rAF loop, driving Lenis from it (rather than its own)
 * keeps both clocks in lockstep, which is what ScrollTrigger.update()
 * needs to stay in sync with smoothed scroll.
 */
export function getLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;

  lenis = new Lenis({
    autoRaf: false,
    virtualScroll: (data) => virtualScrollHandler?.(data) ?? true,
  });

  lenis.on("scroll", ({ progress, velocity }) => {
    scrollStore.setState({ progress, velocity });
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyLenis(): void {
  lenis?.destroy();
  lenis = null;
}
