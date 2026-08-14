import { useEffect, useRef } from "react";
import { gsap, SplitText } from "~/lib/gsap";

/**
 * Entrance: the name draws itself in char by char, then the rule and hanko
 * mark settle after — no full-screen gate, just an in-place reveal timed
 * with deliberate pauses (stagger, offset overlaps) rather than density.
 */
export function HeroIntro() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const rule = ruleRef.current;
    const mark = markRef.current;
    const label = labelRef.current;
    if (!title || !subtitle || !rule || !mark || !label) return;

    const titleSplit = new SplitText(title, { type: "chars", mask: "chars" });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(titleSplit.chars, { yPercent: 0, autoAlpha: 1 });
      gsap.set([subtitle, rule, mark, label], { autoAlpha: 1, y: 0, scaleX: 1, scale: 1 });
      return () => {
        titleSplit.revert();
      };
    }

    gsap.set(titleSplit.chars, { yPercent: 110, autoAlpha: 0 });
    gsap.set(subtitle, { autoAlpha: 0, y: 12 });
    gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(mark, { scale: 0, autoAlpha: 0 });
    gsap.set(label, { autoAlpha: 0, y: 16 });

    const tl = gsap.timeline({ delay: 0.2 });

    tl.to(titleSplit.chars, {
      yPercent: 0,
      autoAlpha: 1,
      duration: 1,
      stagger: 0.04,
      ease: "expo.out",
    })
      .to(subtitle, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5")
      .to(rule, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, "-=0.3")
      .to(mark, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(3)" }, "-=0.25")
      .to(label, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.6");

    return () => {
      tl.kill();
      titleSplit.revert();
    };
  }, []);

  return (
    <section className="relative flex min-h-[85vh] items-end overflow-hidden px-6 pb-20 sm:px-12 sm:pb-28">
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 text-xs tracking-[0.4em] text-taupe [writing-mode:vertical-rl] sm:right-12 sm:block"
      >
        開発者 · PORTFOLIO
      </div>

      <div className="max-w-2xl">
        <h1
          ref={titleRef}
          className="font-serif text-5xl leading-[1.15] font-medium text-ink sm:text-7xl"
        >
          Tom B.
        </h1>

        <div className="mt-8 flex items-center gap-3">
          <div ref={ruleRef} className="h-px w-16 bg-stone sm:w-24" />
          <div ref={markRef} className="h-2 w-2 bg-clay" />
        </div>

        <p ref={subtitleRef} className="mt-6 text-base tracking-wide text-taupe sm:text-lg">
          Développeur backend.
        </p>
      </div>
    </section>
  );
}
