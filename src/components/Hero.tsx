import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "~/lib/gsap";

/**
 * Composition: a kakemono (hanging scroll) — generous negative space above,
 * the signature ("Tom B.") sits grounded on a plain hairline rule at the
 * bottom, the way a painter signs beneath the picture rather than inside
 * it. The scroll's vertical title now lives in ScrollRail (layout-level,
 * persists past the hero) rather than here.
 *
 * Entrance: the name draws itself in char by char, then the rule draws
 * out, the caption settles last — no full-screen gate, just an in-place
 * reveal.
 */
export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const title = titleRef.current;
      const rule = ruleRef.current;
      const subtitle = subtitleRef.current;
      if (!title || !rule || !subtitle) return;

      // SplitText auto-reverts along with everything else useGSAP
      // creates here, once the component unmounts — no manual
      // titleSplit.revert() needed.
      const titleSplit = new SplitText(title, { type: "chars", mask: "chars" });
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(titleSplit.chars, { yPercent: 0, autoAlpha: 1 });
        gsap.set([rule, subtitle], { autoAlpha: 1, y: 0, scaleX: 1 });
        return;
      }

      gsap.set(titleSplit.chars, { yPercent: 110, autoAlpha: 0 });
      gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(subtitle, { autoAlpha: 0, y: 10 });

      gsap
        .timeline({ delay: 0.2 })
        .to(titleSplit.chars, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.04,
          ease: "expo.out",
        })
        .to(rule, { scaleX: 1, duration: 0.7, ease: "power3.out" }, "-=0.3")
        .to(subtitle, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");
    },
    { scope: containerRef },
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative flex min-h-dvh flex-col overflow-hidden px-8 py-10 sm:px-16 sm:py-16"
    >
      <div className="absolute bottom-8 left-8 max-w-md sm:bottom-16 sm:left-16 sm:max-w-xl">
        <h1
          ref={titleRef}
          className="font-serif text-6xl leading-[1.1] font-medium text-ink sm:text-8xl"
        >
          Tom B.
        </h1>

        <div
          ref={ruleRef}
          aria-hidden="true"
          className="mt-6 h-px w-44 origin-left bg-stone sm:mt-8 sm:w-56"
        />

        <p
          ref={subtitleRef}
          className="mt-4 text-xs tracking-[0.3em] text-taupe uppercase sm:text-sm"
        >
          Développeur backend
        </p>
      </div>
    </section>
  );
}
