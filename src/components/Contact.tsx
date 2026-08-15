import { useRef } from "react";
import { gsap, useGSAP } from "~/lib/gsap";

interface ContactLink {
  label: string;
  description: string;
  href: string;
}

const links: ContactLink[] = [
  {
    label: "GitHub",
    description: "Code, projets personnels, contributions.",
    href: "https://github.com/t-aize",
  },
  {
    label: "LinkedIn",
    description: "Parcours, expériences, mises à jour.",
    href: "https://linkedin.com/in/tom-bialecki-464a65270",
  },
];

/**
 * Contact, kept to the same restraint as everything above it: no form, no
 * email address on the page itself (that stays a footer-level detail),
 * just the two channels worth reaching out through.
 *
 * Same row list as Projects, reused rather than reinvented: number,
 * label, one line, external mark.
 */
export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const rows = rowRefs.current.filter((el): el is HTMLAnchorElement => el !== null);
      if (!section || rows.length === 0) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(rows, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(rows, { autoAlpha: 0, y: 24 });

      gsap.to(rows, {
        autoAlpha: 1,
        y: 0,
        duration: 1.3,
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
      id="contact"
      ref={sectionRef}
      data-snap-section
      className="relative flex min-h-dvh flex-col justify-center px-8 py-16 sm:px-16"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 flex items-center gap-4 sm:mb-20">
          <span aria-hidden="true" className="font-serif text-base text-taupe">
            連絡
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
          <span className="text-xs tracking-[0.35em] text-taupe uppercase">Contact</span>
        </div>

        <ol className="flex flex-col">
          {links.map((link, index) => (
            <li key={link.label}>
              <a
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-baseline gap-4 border-b border-stone/60 py-8 first:pt-0 last:border-b-0 sm:gap-8"
              >
                <span className="text-sm text-taupe tabular-nums sm:w-10 sm:shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-serif text-2xl text-ink transition-colors group-hover:text-clay sm:text-3xl">
                      {link.label}
                    </h3>
                    <span className="text-xs tracking-[0.25em] text-taupe uppercase transition-colors group-hover:text-clay">
                      Ouvrir ↗
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-taupe">{link.description}</p>
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
