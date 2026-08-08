import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const hero = document.querySelector<HTMLElement>("[data-hero]");

if (hero) {
  const line = hero.querySelector<HTMLElement>("[data-reveal-line]");
  const eyebrow = hero.querySelector<HTMLElement>("[data-hero-eyebrow]");
  const name = hero.querySelector<HTMLElement>("[data-hero-name]");
  const role = hero.querySelector<HTMLElement>("[data-hero-role]");
  const verticalLine = hero.querySelector<HTMLElement>("[data-reveal-line-vertical]");
  const verticalText = hero.querySelector<HTMLElement>("[data-hero-vertical-text]");
  const halo = hero.querySelector<HTMLElement>("[data-hero-halo]");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const split = name ? SplitText.create(name, { type: "words", mask: "words" }) : null;

  if (reduceMotion) {
    // `clearProps` only removes inline styles GSAP itself set — nothing has
    // run yet in this branch, so it would leave the CSS-hidden state
    // (html.js [data-reveal] { opacity: 0 }) in place forever. Set the
    // final values explicitly instead so they actually override it.
    if (line) gsap.set(line, { scaleX: 1 });
    if (verticalLine) gsap.set(verticalLine, { scaleY: 1 });
    gsap.set([eyebrow, role, verticalText].filter(Boolean), { opacity: 1 });
    if (split) gsap.set(split.words, { opacity: 1, yPercent: 0 });
  } else {
    const tl = gsap.timeline({ delay: 0.2, defaults: { ease: "power3.out" } });

    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }).fromTo(
      eyebrow,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.55",
    );

    if (split) {
      tl.fromTo(
        split.words,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "expo.out" },
        "-=0.3",
      );
    }

    tl.fromTo(
      role,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.7 },
      split ? "-=0.55" : "-=0.3",
    );

    if (verticalLine) {
      tl.fromTo(
        verticalLine,
        { scaleY: 0 },
        { scaleY: 1, duration: 1, ease: "power2.inOut" },
        "-=0.3",
      );
    }

    if (verticalText) {
      tl.fromTo(verticalText, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5");
    }
  }

  // Cursor halo: a quiet ambient presence in the empty field. Desktop-only —
  // skipped entirely on touch devices and when reduced motion is requested.
  if (halo && canHover && !reduceMotion) {
    const moveX = gsap.quickTo(halo, "x", { duration: 0.9, ease: "power3.out" });
    const moveY = gsap.quickTo(halo, "y", { duration: 0.9, ease: "power3.out" });
    let revealed = false;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      moveX(event.clientX - rect.left);
      moveY(event.clientY - rect.top);

      if (!revealed) {
        revealed = true;
        gsap.to(halo, { opacity: 0.35, duration: 0.6 });
      }
    });

    hero.addEventListener("pointerleave", () => {
      revealed = false;
      gsap.to(halo, { opacity: 0, duration: 0.6 });
    });
  }
}
