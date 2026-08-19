import { dictionaries, type Lang } from "~/i18n/dictionaries";
import { getLenis, SCROLL_DURATION } from "~/lib/lenis";

/**
 * The page's colophon (奥付, okuzuke): the imprint a Japanese book or
 * scroll closes on: who made it, when, how to reach them. Same restraint
 * as the hero's signature: a hairline rule, small tracked caps, no card
 * grid of social icons. "完" (kanji for "the end") stands in for a mark
 * of completion, the way it closes a manga chapter or a scroll.
 */
export function Footer({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const year = new Date().getFullYear();

  const setLangCookie = (value: Lang) => {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't supported everywhere yet (Firefox, Safari).
    document.cookie = `lang=${value}; path=/; max-age=31536000`;
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
          aria-label={t.footer.contactAria}
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
          <a
            href="https://linkedin.com/in/tom-bialecki-464a65270"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-clay"
          >
            LinkedIn
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
          <button
            type="button"
            onClick={() => getLenis()?.scrollTo("#hero", { duration: SCROLL_DURATION })}
            className="transition-colors hover:text-clay"
          >
            {t.footer.backToTop}
          </button>
        </nav>

        <nav
          aria-label={t.langSwitch.aria}
          className="flex items-center gap-3 text-xs tracking-[0.3em] text-taupe uppercase"
        >
          <a
            href="/fr"
            aria-current={lang === "fr" ? "page" : undefined}
            onClick={() => setLangCookie("fr")}
            className={
              lang === "fr"
                ? "text-ink transition-colors hover:text-clay"
                : "transition-colors hover:text-clay"
            }
          >
            FR
          </a>
          <span aria-hidden="true" className="text-stone">
            ·
          </span>
          <a
            href="/en"
            aria-current={lang === "en" ? "page" : undefined}
            onClick={() => setLangCookie("en")}
            className={
              lang === "en"
                ? "text-ink transition-colors hover:text-clay"
                : "transition-colors hover:text-clay"
            }
          >
            EN
          </a>
        </nav>
      </div>
    </footer>
  );
}
