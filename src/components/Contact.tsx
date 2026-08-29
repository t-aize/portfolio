import { useRef } from "react";
import { dictionaries, type Lang } from "~/i18n/dictionaries";
import { gsap, useGSAP } from "~/lib/gsap";

/**
 * The closing signature, mirroring the Hero's opening one: same kakemono
 * composition — generous negative space, content grounded on a hairline —
 * flipped to the opposite corner (bottom-right here, bottom-left there),
 * the way About's watermark and Experience's mirror each other rather
 * than repeating on the same side. Hero states who; this states how to
 * reach them — the one slot on the page that's actually interactive
 * rather than descriptive, so the email lives where the subtitle did.
 */
export function Contact({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const title = titleRef.current;
      const rule = ruleRef.current;
      const email = emailRef.current;
      if (!title || !rule || !email) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set([title, rule, email], { autoAlpha: 1, y: 0, scaleX: 1 });
        return;
      }

      gsap.set(title, { autoAlpha: 0, y: 20 });
      gsap.set(rule, { scaleX: 0, transformOrigin: "right center" });
      gsap.set(email, { autoAlpha: 0, y: 10 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        })
        .to(title, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" })
        .to(rule, { scaleX: 1, duration: 0.7, ease: "power3.out" }, "-=0.5")
        .to(email, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4");
    },
    { scope: containerRef },
  );

  return (
    <section
      id="contact"
      ref={containerRef}
      data-snap-section
      className="relative flex min-h-dvh flex-col overflow-hidden px-8 py-10 sm:px-16 sm:py-16"
    >
      <div className="absolute right-8 bottom-8 max-w-md text-right sm:right-16 sm:bottom-16 sm:max-w-xl">
        <h2
          ref={titleRef}
          className="font-serif text-6xl leading-[1.1] font-medium text-ink sm:text-8xl"
        >
          Contact
        </h2>

        <div
          ref={ruleRef}
          aria-hidden="true"
          className="mt-6 ml-auto h-px w-44 origin-right bg-stone sm:mt-8 sm:w-56"
        />

        <a
          ref={emailRef}
          href="mailto:tom.bialecki2211@gmail.com"
          aria-label={t.contact.emailAria}
          className="mt-4 inline-block text-xs tracking-[0.3em] text-taupe uppercase transition-colors hover:text-clay sm:text-sm"
        >
          tom.bialecki2211@gmail.com
        </a>
      </div>
    </section>
  );
}
