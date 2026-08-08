import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const list = document.querySelector<HTMLElement>("[data-project-list]");

if (list) {
  const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-project-row]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Same lesson as the hero: set the final values explicitly rather than
  // gsap.set(..., { clearProps: "all" }) here, since nothing has animated
  // yet in this branch — clearProps would have nothing of its own to undo
  // and the html.js [data-reveal] CSS rule would stay in effect.
  if (reduceMotion) {
    gsap.set(rows, { opacity: 1, y: 0 });
  } else {
    gsap.set(rows, { opacity: 0, y: 24 });

    // ScrollTrigger.batch instead of one ScrollTrigger per row: rows that
    // cross the viewport threshold together animate together, and it's a
    // handful of triggers total instead of one per project.
    ScrollTrigger.batch(rows, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        }),
    });
  }
}
