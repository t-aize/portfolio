import { useRef } from "react";
import { gsap, useGSAP } from "~/lib/gsap";

/**
 * A short, plain-spoken bio, the section between the signature and the
 * work. Its signature move is typographic rather than kinetic: 略歴
 * (biography) sits behind the paragraph as an oversized, near-invisible
 * watermark instead of a small eyebrow label, the way a seal is pressed
 * faintly into the corner of a page rather than announced. A soft ink
 * wash blooms in first, then the text settles on top of it.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const bloom = bloomRef.current;
      const paras = paraRefs.current.filter((el): el is HTMLParagraphElement => el !== null);
      if (!section || paras.length === 0) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        if (bloom) gsap.set(bloom, { autoAlpha: 1 });
        gsap.set(paras, { autoAlpha: 1, y: 0 });
        return;
      }

      if (bloom) gsap.set(bloom, { autoAlpha: 0, scale: 0.7 });
      gsap.set(paras, { autoAlpha: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
        },
      });

      if (bloom) {
        tl.to(bloom, { autoAlpha: 1, scale: 1, duration: 1.6, ease: "power2.out" });
      }
      tl.to(
        paras,
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.18,
          ease: "power2.out",
        },
        bloom ? "-=1.1" : 0,
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      data-snap-section
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-8 py-16 sm:px-16"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 translate-x-[15%] font-serif text-[13rem] leading-none text-ink/[0.05] select-none sm:text-[22rem]"
      >
        略歴
      </span>

      <div
        ref={bloomRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/[0.05] blur-3xl sm:h-[36rem] sm:w-[36rem]"
      />

      <div className="relative mx-auto max-w-2xl">
        <span className="text-xs tracking-[0.35em] text-taupe uppercase">À propos</span>

        <p
          ref={(el) => {
            paraRefs.current[0] = el;
          }}
          className="mt-6 text-base leading-relaxed text-taupe sm:mt-8 sm:text-lg"
        >
          Étudiant en BTS SIO option SLAM, autodidacte en développement backend depuis plus de cinq
          ans. Je travaille surtout en TypeScript et Node.js, avec un faible pour les systèmes temps
          réel. La plupart des projets ci-dessous sont nés de cet intérêt plutôt que d'un besoin
          précis.
        </p>
      </div>
    </section>
  );
}
