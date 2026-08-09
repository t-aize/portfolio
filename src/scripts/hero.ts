import { gsap } from "gsap";
import { createInkScene, type InkSceneHandle } from "./ink/InkScene";
import { createKineticText, type KineticTextHandle } from "./kinetic-text/KineticText";

const hero = document.querySelector<HTMLElement>("[data-hero]");

if (hero) {
  void initHero(hero);
}

async function initHero(hero: HTMLElement): Promise<void> {
  const line = hero.querySelector<HTMLElement>("[data-reveal-line]");
  const eyebrow = hero.querySelector<HTMLElement>("[data-hero-eyebrow]");
  const name = hero.querySelector<HTMLElement>("[data-hero-name]");
  const role = hero.querySelector<HTMLElement>("[data-hero-role]");
  const verticalLine = hero.querySelector<HTMLElement>("[data-reveal-line-vertical]");
  const verticalText = hero.querySelector<HTMLElement>("[data-hero-vertical-text]");
  const inkCanvas = hero.querySelector<HTMLCanvasElement>("[data-hero-ink-canvas]");
  const loader = hero.querySelector<HTMLElement>("[data-hero-loader]");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Ink background -----------------------------------------------
  const inkScene: InkSceneHandle | null =
    !reduceMotion && inkCanvas ? createInkScene(inkCanvas, hero) : null;

  // --- Kinetic name ----------------------------------------------------
  // Waiting on document.fonts.ready before painting the texture avoids
  // capturing a fallback-font frame and then flashing to the real one.
  let kinetic: KineticTextHandle | null = null;
  if (!reduceMotion && name) {
    await document.fonts.ready;
    kinetic = createKineticText(name);
    if (kinetic) {
      // The <h1> was CSS-hidden (data-reveal) this whole time, so it never
      // flashed the real, un-animated text while fonts/WebGL were still
      // initializing above. The real glyphs are already color:transparent
      // by this point (KineticText.ts sets that itself once its canvas is
      // painting), so it's now safe to reveal the container — the
      // shader's own uReveal wipe drives the visible entrance from here.
      gsap.set(name, { opacity: 1 });
    }
  }

  // Hide the loading state now that WebGL/font setup (if any) has settled.
  // For reduced motion this fires essentially immediately, since that
  // branch never waits on document.fonts.ready above.
  if (loader) {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => loader.remove(),
    });
  }

  if (reduceMotion) {
    // `clearProps` only removes inline styles GSAP itself set — nothing has
    // run yet in this branch, so it would leave the CSS-hidden state
    // (html.js [data-reveal] { opacity: 0 }) in place forever. Set the
    // final values explicitly instead so they actually override it.
    if (line) gsap.set(line, { scaleX: 1 });
    if (verticalLine) gsap.set(verticalLine, { scaleY: 1 });
    gsap.set([eyebrow, role, verticalText, name].filter(Boolean), { opacity: 1 });
    // Ink scene and kinetic text are both skipped entirely above for
    // reduced motion, so the real <h1> just renders normally — no extra
    // work needed to reveal it.
  } else {
    const tl = gsap.timeline({ delay: 0.2, defaults: { ease: "power3.out" } });

    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }).fromTo(
      eyebrow,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.55",
    );

    if (inkScene) {
      tl.to(
        inkScene.uniforms.opacity,
        { value: 1, duration: 1.4, ease: "power2.out" },
        "-=0.5",
      );
    }

    if (kinetic) {
      tl.to(kinetic.uniforms.reveal, { value: 1, duration: 1.1, ease: "expo.out" }, "-=0.9");
    } else if (name) {
      // WebGL unavailable — fall back to a plain opacity/translate reveal
      // on the real text instead of the shader wipe.
      tl.fromTo(name, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.9");
    }

    tl.fromTo(role, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.55");

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
}
