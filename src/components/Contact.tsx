"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { siteConfig } from "~/config/site";
import { useScrollReveal } from "~/hooks/use-scroll-reveal";

/**
 * The closing signature, mirroring the Hero's opening one: same kakemono
 * composition — generous negative space, content grounded on a hairline —
 * flipped to the opposite corner (bottom-right here, bottom-left there),
 * the way About's watermark and Experience's mirror each other rather
 * than repeating on the same side. Hero states who; this states how to
 * reach them — the one slot on the page that's actually interactive
 * rather than descriptive, so the email lives where the subtitle did.
 */
export function Contact() {
  const t = useTranslations("contact");
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);

  useScrollReveal({
    scope: containerRef,
    trigger: containerRef,
    getSteps: () => {
      const title = titleRef.current;
      const rule = ruleRef.current;
      const email = emailRef.current;
      if (!title || !rule || !email) return null;

      return [
        {
          targets: title,
          from: { autoAlpha: 0, y: 20 },
          to: { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" },
        },
        {
          targets: rule,
          from: { scaleX: 0, transformOrigin: "right center" },
          to: { scaleX: 1, duration: 0.7, ease: "power3.out" },
          position: "-=0.5",
        },
        {
          targets: email,
          from: { autoAlpha: 0, y: 10 },
          to: { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
          position: "-=0.4",
        },
      ];
    },
  });

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
          href={`mailto:${siteConfig.email}`}
          aria-label={t("emailAria")}
          className="mt-4 inline-block text-xs tracking-[0.3em] text-taupe uppercase transition-colors hover:text-clay sm:text-sm"
        >
          {siteConfig.email}
        </a>
      </div>
    </section>
  );
}
