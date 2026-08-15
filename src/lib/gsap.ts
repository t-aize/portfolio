import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// GSAP is fully free (incl. ScrollTrigger, SplitText, MorphSVGPlugin)
// since the Webflow acquisition, no Club token, no private registry.
// Plugin registration must stay client-only: GSAP touches the DOM
// immediately on registration, which throws during TanStack Start's SSR
// pass.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin, useGSAP);
}

export { gsap, MorphSVGPlugin, ScrollTrigger, SplitText, useGSAP };
