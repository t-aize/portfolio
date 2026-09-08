import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// GSAP is fully free (incl. ScrollTrigger, SplitText, MorphSVGPlugin)
// since the Webflow acquisition, no Club token, no private registry.
// Plugin registration must stay client-only: GSAP touches the DOM
// immediately on registration, which would throw if this module were
// ever evaluated during a Server Component's render. Every importer is
// a "use client" component, so in practice this only runs in the
// browser — this guard just makes that safe if Next ever prerenders or
// statically analyzes the module on the server too.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin, useGSAP);
}

export { gsap, MorphSVGPlugin, ScrollTrigger, SplitText, useGSAP };
