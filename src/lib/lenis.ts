import Lenis from "lenis";
import { gsap, ScrollTrigger } from "~/lib/gsap";
import { scrollStore } from "~/store/scroll";

let lenis: Lenis | null = null;

/**
 * Module singleton so Lenis survives route changes instead of being
 * remounted with a component. `autoRaf: false` because GSAP's ticker
 * already runs a rAF loop — driving Lenis from it (rather than its own)
 * keeps both clocks in lockstep, which is what ScrollTrigger.update()
 * needs to stay in sync with smoothed scroll.
 */
export function getLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;

  lenis = new Lenis({ autoRaf: false });

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
