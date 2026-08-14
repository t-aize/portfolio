import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAP is fully free (incl. ScrollTrigger) since the Webflow acquisition —
// no Club token, no private registry. Plugin registration must stay
// client-only: GSAP touches the DOM immediately on registration, which
// throws during TanStack Start's SSR pass.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
