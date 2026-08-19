import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { type ProjectData, projects } from "~/data/projects";
import { dictionaries, type Lang } from "~/i18n/dictionaries";
import { gsap, useGSAP } from "~/lib/gsap";

/**
 * The project list as an index, not a card grid: a table of contents for
 * a scroll, not a gallery. Backend work rarely has a screenshot worth
 * showing off, so the row itself (number, name, one line, stack) carries
 * the content instead of a thumbnail.
 *
 * Rows fade/lift in on scroll, staggered, mirroring the hero's entrance
 * without repeating it (no char-split, just the same restraint).
 */
export function Projects({ lang }: { lang: Lang }) {
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
      id="projects"
      ref={sectionRef}
      data-snap-section
      className="relative flex min-h-dvh flex-col justify-center px-8 py-16 sm:px-16"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 flex items-center gap-4 sm:mb-20">
          <span aria-hidden="true" className="font-serif text-base text-taupe">
            作品
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
          <span className="text-xs tracking-[0.35em] text-taupe uppercase">
            {t.projects.eyebrow}
          </span>
        </div>

        <ol className="flex flex-col">
          {projects.map((project, index) => (
            <li key={project.id}>
              <ProjectRow
                project={project}
                description={t.projects.descriptions[project.id]}
                labels={{ github: t.projects.github, private: t.projects.private }}
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

function ProjectRow({
  project,
  description,
  labels,
  index,
  ref,
}: {
  project: ProjectData;
  description: string;
  labels: { github: string; private: string };
  index: number;
  ref: React.Ref<HTMLElement>;
}) {
  const className =
    "group flex flex-col gap-2 border-b border-stone/60 py-8 first:pt-0 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-8";

  const content = (
    <>
      <span className="text-sm text-taupe tabular-nums sm:w-10 sm:shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-serif text-2xl text-ink transition-colors group-hover:text-clay sm:text-3xl">
            {project.title}
          </h3>
          <span
            className={
              project.href
                ? "inline-flex items-center gap-1 text-xs tracking-[0.25em] text-taupe uppercase transition-colors group-hover:text-clay"
                : "text-xs tracking-[0.25em] text-stone uppercase"
            }
          >
            {project.href ? (
              <>
                {labels.github}
                <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.5} />
              </>
            ) : (
              labels.private
            )}
          </span>
        </div>
        <p className="mt-2 max-w-xl text-sm text-taupe">{description}</p>
        <p className="mt-3 text-xs tracking-[0.25em] text-taupe/80 uppercase">
          {project.stack.join(" · ")}
        </p>
      </div>
    </>
  );

  if (project.href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={project.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={className}>
      {content}
    </div>
  );
}
