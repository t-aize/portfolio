"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useScrollReveal } from "~/hooks/use-scroll-reveal";

/**
 * A short, plain-spoken bio, the section between the signature and the
 * work. Its signature move is typographic rather than kinetic: 略歴
 * (biography) sits behind the paragraph as an oversized, near-invisible
 * watermark instead of a small eyebrow label, the way a seal is pressed
 * faintly into the corner of a page rather than announced. A soft ink
 * wash blooms in first, then the text settles on top of it.
 */
export function About() {
  const t = useTranslations("about");
  const sectionRef = useRef<HTMLElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);

  useScrollReveal({
    scope: sectionRef,
    trigger: sectionRef,
    getSteps: () => {
      const bloom = bloomRef.current;
      const para = paraRef.current;
      if (!para) return null;

      return [
        ...(bloom
          ? [
              {
                targets: bloom,
                from: { autoAlpha: 0, scale: 0.7 },
                to: { autoAlpha: 1, scale: 1, duration: 1.6, ease: "power2.out" },
              },
            ]
          : []),
        {
          targets: para,
          from: { autoAlpha: 0, y: 20 },
          to: { autoAlpha: 1, y: 0, duration: 1.1, ease: "power2.out" },
          position: bloom ? "-=1.1" : 0,
        },
      ];
    },
  });

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
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
          <span className="text-xs tracking-[0.35em] text-taupe uppercase">{t("eyebrow")}</span>
        </div>

        <p ref={paraRef} className="mt-6 text-base leading-relaxed text-taupe sm:mt-8 sm:text-lg">
          {t("paragraph")}
        </p>
      </div>
    </section>
  );
}
