import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Both locales always carry an explicit prefix (/fr, /en) — no bare
  // French root — matching the routing rules the Astro site enforced by
  // hand (prefixDefaultLocale: true, redirectToDefaultLocale: false).
  localePrefix: "always",
  // Same cookie name/lifetime the old client-side redirect script and the
  // footer's language switch used, so a returning visitor's saved
  // preference keeps working across the migration.
  localeCookie: {
    name: "lang",
    maxAge: 60 * 60 * 24 * 365,
  },
  // next-intl's middleware would otherwise set a `Link` response header
  // assuming every path exists in every locale — not true for
  // /mentions-legales (French-only, no /en counterpart). The per-page
  // `generateMetadata` alternates (buildAlternates in
  // lib/page-metadata.ts) already emit the correct hreflang <link>
  // tags, carve-out included, so this avoids a second, less accurate
  // source of hreflang for the same pages.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
