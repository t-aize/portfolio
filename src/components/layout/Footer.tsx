import { ArrowUp, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { dictionaries, type Lang } from "~/i18n/dictionaries";
import { getLenis, SCROLL_DURATION } from "~/lib/lenis";

/**
 * The page's colophon (奥付, okuzuke): the imprint a Japanese book or
 * scroll closes on: who made it, when, how to reach them. Same restraint
 * as the hero's signature: a hairline rule, small tracked caps. GitHub
 * and LinkedIn get a small mark (same size/weight as the arrows used
 * elsewhere) since those are the two links with an actual recognizable
 * logo; Veille/Mentions légales/back-to-top stay plain text rather than
 * reaching for a generic icon just to have one.
 *
 * Below sm, the flat "GitHub · LinkedIn · Veille · ..." row doesn't fit
 * on one line and wrapping it reads as a paragraph, not a nav — so on
 * mobile it moves into a bottom sheet behind a "Liens" toggle instead,
 * and the FR/EN switch sits next to the copyright line rather than as
 * its own row. Desktop keeps the original flat row; only the markup
 * for it is duplicated between the two, since the two layouts diverge
 * too much (fixed-position sheet vs. inline row) for one shared DOM
 * structure to do both cleanly.
 */
interface Props {
  lang: Lang;
  frHref: string;
  enHref: string;
}

export function Footer({ lang, frHref, enHref }: Props) {
  const t = dictionaries[lang];
  const year = new Date().getFullYear();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sheetOpen]);

  const setLangCookie = (value: Lang) => {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't supported everywhere yet (Firefox, Safari).
    document.cookie = `lang=${value}; path=/; max-age=31536000`;
  };

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: SCROLL_DURATION });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const langPillClass = (active: boolean) =>
    active
      ? "rounded-full bg-ink px-3 py-1.5 text-cream transition-colors"
      : "rounded-full px-3 py-1.5 text-taupe transition-colors hover:text-clay";

  return (
    <footer className="border-t border-stone/60 px-8 py-8 sm:px-16 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center justify-between gap-4 sm:contents">
          <p className="flex items-baseline gap-3 text-xs tracking-[0.3em] text-taupe uppercase">
            <span aria-hidden="true" className="font-serif text-sm normal-case">
              完
            </span>
            © {year} Tom B.
          </p>

          {/* Pill toggle rather than the old flush "FR · EN" text: gives
              each language a real hit target and an unambiguous active
              state (filled, not just a color swap). Lives next to the
              copyright on every breakpoint, not as its own row. */}
          <nav
            aria-label={t.langSwitch.aria}
            className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase sm:order-3"
          >
            <a
              href={frHref}
              aria-current={lang === "fr" ? "page" : undefined}
              onClick={() => setLangCookie("fr")}
              className={langPillClass(lang === "fr")}
            >
              FR
            </a>
            <a
              href={enHref}
              aria-current={lang === "en" ? "page" : undefined}
              onClick={() => setLangCookie("en")}
              className={langPillClass(lang === "en")}
            >
              EN
            </a>
          </nav>
        </div>

        {/* Desktop: unchanged flat row. */}
        <nav
          aria-label={t.footer.navAria}
          className="hidden text-xs tracking-[0.3em] text-taupe uppercase sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2"
        >
          <a
            href="https://github.com/t-aize"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-clay"
          >
            <GithubMark className="h-3 w-3" />
            @t-aize
          </a>
          <span aria-hidden="true" className="text-stone">
            ·
          </span>
          <a
            href="https://linkedin.com/in/tom-bialecki-464a65270"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-clay"
          >
            <LinkedinMark className="h-3 w-3" />
            tom-bialecki
          </a>
          <span aria-hidden="true" className="text-stone">
            ·
          </span>
          <a href={`/${lang}/veille`} className="transition-colors hover:text-clay">
            {t.footer.veille}
          </a>
          {lang === "fr" && (
            <>
              <span aria-hidden="true" className="text-stone">
                ·
              </span>
              <a href="/fr/mentions-legales" className="transition-colors hover:text-clay">
                Mentions légales
              </a>
            </>
          )}
          <span aria-hidden="true" className="text-stone">
            ·
          </span>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 transition-colors hover:text-clay"
          >
            {t.footer.backToTop}
            <ArrowUp aria-hidden="true" size={12} strokeWidth={1.5} />
          </button>
        </nav>

        {/* Mobile: trigger for the bottom sheet below. */}
        <button
          type="button"
          aria-expanded={sheetOpen}
          aria-controls="footer-sheet"
          onClick={() => setSheetOpen((open) => !open)}
          className="flex items-center justify-center gap-2 border-t border-stone/60 pt-4 text-xs tracking-[0.3em] text-taupe uppercase transition-colors hover:text-clay sm:hidden"
        >
          {t.footer.moreLabel}
          <ChevronUp
            aria-hidden="true"
            size={14}
            strokeWidth={1.5}
            className={`transition-transform duration-300 motion-reduce:transition-none ${sheetOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Bottom sheet: fixed overlay, mobile only. Always mounted so the
          close transition can play; `inert` pulls it out of the tab
          order and off-screen focus reach while closed instead of just
          hiding it visually. */}
      <div className="sm:hidden" inert={!sheetOpen}>
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setSheetOpen(false)}
          className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 motion-reduce:transition-none ${
            sheetOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <nav
          id="footer-sheet"
          aria-label={t.footer.navAria}
          className={`fixed inset-x-0 bottom-0 z-40 overscroll-contain rounded-t-2xl border-t border-stone/60 bg-cream px-8 py-8 text-xs tracking-[0.3em] text-taupe uppercase shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
            sheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex flex-col gap-5">
            <a
              href="https://github.com/t-aize"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-clay"
            >
              <GithubMark className="h-3.5 w-3.5" />
              @t-aize
            </a>
            <a
              href="https://linkedin.com/in/tom-bialecki-464a65270"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-clay"
            >
              <LinkedinMark className="h-3.5 w-3.5" />
              tom-bialecki
            </a>
            <a href={`/${lang}/veille`} className="transition-colors hover:text-clay">
              {t.footer.veille}
            </a>
            {lang === "fr" && (
              <a href="/fr/mentions-legales" className="transition-colors hover:text-clay">
                Mentions légales
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                scrollToTop();
                setSheetOpen(false);
              }}
              className="inline-flex items-center gap-1 border-t border-stone/60 pt-5 transition-colors hover:text-clay"
            >
              {t.footer.backToTop}
              <ArrowUp aria-hidden="true" size={12} strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </div>
    </footer>
  );
}

// lucide-react dropped brand marks a while back, so these two are hand-
// inlined instead of pulling in a whole icons package for two glyphs.
// Paths from Simple Icons (simple-icons/simple-icons), unmodified.
function GithubMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
