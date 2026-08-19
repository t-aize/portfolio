import { useRef } from "react";
import { type ExperienceData, experience } from "~/data/experience";
import { dictionaries, type Lang } from "~/i18n/dictionaries";
import { gsap, useGSAP } from "~/lib/gsap";

/**
 * A row list like Projects (number, title, one line, stack), but with a
 * period standing in for Projects' GitHub/Private badge, and About's
 * oversized near-invisible watermark kanji behind it — mirrored to the
 * left instead of About's right, so the two sections don't read as the
 * same device repeated on the same side.
 */
export function Experience({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const rows = rowRefs.current.filter((el): el is HTMLElement => el !== null);
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
      id="experience"
      ref={sectionRef}
      data-snap-section
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-8 py-16 sm:px-16"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-0 -translate-x-[15%] -translate-y-1/2 font-serif text-[13rem] leading-none text-ink/[0.05] select-none sm:text-[22rem]"
      >
        経験
      </span>

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-16 flex items-center gap-4 sm:mb-20">
          <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
          <span className="text-xs tracking-[0.35em] text-taupe uppercase">
            {t.experience.eyebrow}
          </span>
        </div>

        <ol className="flex flex-col">
          {experience.map((entry, index) => (
            <li key={entry.id}>
              <ExperienceRow
                entry={entry}
                title={t.experience.titles[entry.id]}
                period={t.experience.periods[entry.id]}
                description={t.experience.descriptions[entry.id]}
                index={index}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ExperienceRow({
  entry,
  title,
  period,
  description,
  index,
  ref,
}: {
  entry: ExperienceData;
  title: string;
  period: string;
  description: string;
  index: number;
  ref: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className="flex flex-col gap-2 border-b border-stone/60 py-8 first:pt-0 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-8"
    >
      <span className="text-sm text-taupe tabular-nums sm:w-10 sm:shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-serif text-2xl text-ink sm:text-3xl">{title}</h3>
          <span className="text-xs tracking-[0.25em] text-taupe uppercase">{period}</span>
        </div>
        <p className="mt-2 max-w-xl text-sm text-taupe">{description}</p>
        <p className="mt-3 text-xs tracking-[0.25em] text-taupe/80 uppercase">
          {entry.stack.join(" · ")}
        </p>
      </div>
    </div>
  );
}
