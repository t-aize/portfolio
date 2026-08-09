import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const lenis = new Lenis({
  // Lenis must not drive its own rAF loop — GSAP's ticker below drives
  // Lenis, ScrollTrigger, and the ink shader's clock off the same clock so
  // none of them can ever desync from the others under a stalled tab or a
  // heavy frame.
  autoRaf: false,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  // gsap.ticker reports time in seconds, lenis.raf expects milliseconds.
  lenis.raf(time * 1000);
});

// Let Lenis own the easing; GSAP's own catch-up smoothing after a stalled
// tab would otherwise fight it and cause a visible jump.
gsap.ticker.lagSmoothing(0);
