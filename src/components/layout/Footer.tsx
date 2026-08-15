import { getLenis } from "~/lib/lenis";

/**
 * The page's colophon (奥付, okuzuke) — the imprint a Japanese book or
 * scroll closes on: who made it, when, how to reach them. Same restraint
 * as the hero's signature: a hairline rule, small tracked caps, no card
 * grid of social icons. "完" (kanji for "the end") stands in for a mark
 * of completion, the way it closes a manga chapter or a scroll.
 *
 * Lives in components/layout (not components/) because, like RootLayout,
 * it's persistent chrome rendered on every route, not page content.
 */
export function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-stone/60 px-8 py-8 sm:px-16 sm:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-baseline gap-3 text-xs tracking-[0.3em] text-taupe uppercase">
          <span aria-hidden="true" className="font-serif text-sm normal-case">
            完
          </span>
          © {year} Tom B.
        </p>

        <nav
          aria-label="Contact"
          className="flex items-center gap-4 text-xs tracking-[0.3em] text-taupe uppercase"
        >
          <a
            href="https://github.com/t-aize"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-clay"
          >
            GitHub
          </a>
          <span aria-hidden="true" className="text-stone">
            ·
          </span>
          <a href="mailto:tom.bialecki2211@gmail.com" className="transition-colors hover:text-clay">
            Email
          </a>
          <span aria-hidden="true" className="text-stone">
            ·
          </span>
          <button type="button" onClick={scrollToTop} className="transition-colors hover:text-clay">
            Haut de page ↑
          </button>
        </nav>
      </div>
    </footer>
  );
}
