import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { algorithms, sources, timeline } from "~/data/veille";
import { dictionaries, type Lang } from "~/i18n/dictionaries";
import { gsap, useGSAP } from "~/lib/gsap";

// Fades/lifts a group of rows in as it scrolls into view, or shows them
// immediately if motion is reduced — same treatment as Projects' rows,
// applied per subsection here since this page isn't one full-viewport
// section but a flowing article.
function reveal(rows: HTMLElement[], trigger: HTMLElement, reduceMotion: boolean) {
  if (rows.length === 0) return;

  if (reduceMotion) {
    gsap.set(rows, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.set(rows, { autoAlpha: 0, y: 20 });
  gsap.to(rows, {
    autoAlpha: 1,
    y: 0,
    duration: 1.1,
    stagger: 0.12,
    ease: "power2.out",
    scrollTrigger: { trigger, start: "top 80%" },
  });
}

/**
 * The site's one non-portfolio page: a BTS SIO "veille technologique"
 * report, kept in the same voice as the rest of the site (hairlines,
 * tracked caps, no decorative icons) rather than switching to a
 * report/card aesthetic. Flows naturally instead of snapping full-
 * viewport per section — it's an article, not a portfolio section.
 */
export function Veille({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const introRef = useRef<HTMLDivElement>(null);
  const algorithmsSectionRef = useRef<HTMLDivElement>(null);
  const algorithmRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineSectionRef = useRef<HTMLDivElement>(null);
  const timelineRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const adoptionSectionRef = useRef<HTMLDivElement>(null);
  const sourcesSectionRef = useRef<HTMLDivElement>(null);
  const sourceRowRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (introRef.current) reveal([introRef.current], introRef.current, reduceMotion);

    if (algorithmsSectionRef.current) {
      reveal(
        algorithmRowRefs.current.filter((el): el is HTMLDivElement => el !== null),
        algorithmsSectionRef.current,
        reduceMotion,
      );
    }

    if (timelineSectionRef.current) {
      reveal(
        timelineRowRefs.current.filter((el): el is HTMLDivElement => el !== null),
        timelineSectionRef.current,
        reduceMotion,
      );
    }

    if (adoptionSectionRef.current) {
      reveal([adoptionSectionRef.current], adoptionSectionRef.current, reduceMotion);
    }

    if (sourcesSectionRef.current) {
      reveal(
        sourceRowRefs.current.filter((el): el is HTMLAnchorElement => el !== null),
        sourcesSectionRef.current,
        reduceMotion,
      );
    }
  }, []);

  return (
    <article className="mx-auto max-w-3xl px-8 py-16 sm:px-16 sm:py-24">
      <a
        href={`/${lang}`}
        className="inline-flex items-center gap-1 text-xs tracking-[0.3em] text-taupe uppercase transition-colors hover:text-clay"
      >
        <ArrowLeft aria-hidden="true" size={12} strokeWidth={1.5} />
        {t.veille.backHome}
      </a>

      <div ref={introRef} className="mt-10 sm:mt-14">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="font-serif text-base text-taupe">
            暗号
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
          <span className="text-xs tracking-[0.35em] text-taupe uppercase">{t.veille.eyebrow}</span>
        </div>

        <h1 className="mt-6 font-serif text-4xl leading-tight text-ink sm:text-5xl">
          {t.veille.title}
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          {t.veille.intro.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-base leading-relaxed text-taupe sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <SubsectionHeading label={t.veille.algorithms.heading} />
      <div ref={algorithmsSectionRef} className="flex flex-col">
        {algorithms.map((algo, index) => (
          <div
            key={algo.id}
            ref={(el) => {
              algorithmRowRefs.current[index] = el;
            }}
            className="flex flex-col gap-2 border-b border-stone/60 py-8 first:pt-0 last:border-b-0"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-serif text-2xl text-ink sm:text-3xl">{algo.name}</h3>
              <span className="text-xs tracking-[0.25em] text-taupe uppercase">
                {t.veille.algorithms.tags[algo.id]}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm text-taupe">
              {t.veille.algorithms.descriptions[algo.id]}
            </p>
            <p className="mt-3 text-xs tracking-[0.25em] text-taupe uppercase">{algo.fipsRef}</p>
          </div>
        ))}
      </div>

      <SubsectionHeading label={t.veille.timeline.heading} />
      <div ref={timelineSectionRef} className="flex flex-col">
        {timeline.map((entry, index) => (
          <div
            key={entry.id}
            ref={(el) => {
              timelineRowRefs.current[index] = el;
            }}
            className="flex flex-col gap-2 border-b border-stone/60 py-6 first:pt-0 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-8"
          >
            <span className="text-sm text-taupe tabular-nums sm:w-28 sm:shrink-0">
              {t.veille.timeline.years[entry.id]}
            </span>
            <p className="flex-1 text-sm text-taupe">{t.veille.timeline.descriptions[entry.id]}</p>
          </div>
        ))}
      </div>

      <SubsectionHeading label={t.veille.adoption.heading} />
      <div ref={adoptionSectionRef}>
        <p className="max-w-2xl text-sm leading-relaxed text-taupe sm:text-base">
          {t.veille.adoption.paragraph}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {t.veille.adoption.stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-4xl text-ink sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-xs tracking-[0.25em] text-taupe uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <SubsectionHeading label={t.veille.sources.heading} />
      <div ref={sourcesSectionRef} className="flex flex-col">
        {sources.map((source, index) => (
          <a
            key={source.id}
            ref={(el) => {
              sourceRowRefs.current[index] = el;
            }}
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col gap-1 border-b border-stone/60 py-6 first:pt-0 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
          >
            <div>
              <h3 className="font-serif text-xl text-ink transition-colors group-hover:text-clay">
                {source.label}
              </h3>
              <p className="mt-1 max-w-xl text-sm text-taupe">
                {t.veille.sources.descriptions[source.id]}
              </p>
            </div>
            <ArrowUpRight
              aria-hidden="true"
              size={14}
              strokeWidth={1.5}
              className="shrink-0 text-taupe transition-colors group-hover:text-clay"
            />
          </a>
        ))}
      </div>
    </article>
  );
}

function SubsectionHeading({ label }: { label: string }) {
  return (
    <div className="mt-20 mb-10 flex items-center gap-4 sm:mt-24 sm:mb-12">
      <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
      <span className="text-xs tracking-[0.35em] text-taupe uppercase">{label}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
    </div>
  );
}
