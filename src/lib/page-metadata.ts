import { getPathname } from "~/i18n/navigation";
import { type Locale, routing } from "~/i18n/routing";

interface AlternatesOptions {
  locale: Locale;
  /** Locale-agnostic pathname, e.g. "/", "/veille", "/mentions-legales". */
  pathname: string;
  /**
   * False for a page that only exists in one locale (mentions-legales, a
   * French legal notice with no English counterpart) — suppresses the
   * hreflang block entirely rather than pointing it at a route that 404s.
   */
  translated?: boolean;
}

/**
 * Builds `alternates.canonical` + `alternates.languages` (incl.
 * x-default) the way the old Layout.astro did by hand, now driven by
 * next-intl's routing config instead of a manual locale-prefix regex.
 */
export function buildAlternates({ locale, pathname, translated = true }: AlternatesOptions) {
  const canonical = getPathname({ locale, href: pathname });

  if (!translated) {
    return { canonical };
  }

  const languages: Record<string, string> = { "x-default": "/" };
  for (const loc of routing.locales) {
    languages[loc] = getPathname({ locale: loc, href: pathname });
  }

  return { canonical, languages };
}

export const ogLocaleFor: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_US",
};
