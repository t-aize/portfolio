import { useRef } from "react";
import { gsap, useGSAP } from "~/lib/gsap";

/**
 * A short, plain-spoken bio, the section between the signature and the
 * work, same restraint as everywhere else on the page: no stat cards, no
 * skill-pill grid, just a couple of sentences that say who's writing this
 * and why it exists. Fades/lifts in on scroll, same language as the
 * projects list below it.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const paras = paraRefs.current.filter((el): el is HTMLParagraphElement => el !== null);
      if (!section || paras.length === 0) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(paras, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(paras, { autoAlpha: 0, y: 20 });

      gsap.to(paras, {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.18,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      data-snap-section
      className="relative flex min-h-dvh flex-col justify-center px-8 py-16 sm:px-16"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 flex items-center gap-4 sm:mb-20">
          <span aria-hidden="true" className="font-serif text-base text-taupe">
            略歴
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
          <span className="text-xs tracking-[0.35em] text-taupe uppercase">À propos</span>
        </div>

        <div className="max-w-2xl space-y-6">
          <p
            ref={(el) => {
              paraRefs.current[0] = el;
            }}
            className="text-base leading-relaxed text-taupe sm:text-lg"
          >
            Étudiant en BTS SIO option SLAM, autodidacte en développement backend depuis plus de
            cinq ans. Je travaille surtout en TypeScript et Node.js, avec un faible pour les
            systèmes temps réel. La plupart des projets ci-dessous sont nés de cet intérêt plutôt
            que d'un besoin précis.
          </p>
        </div>
      </div>
    </section>
  );
}
