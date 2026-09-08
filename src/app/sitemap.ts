import type { MetadataRoute } from "next";
import { siteConfig } from "~/config/site";
import { getPathname } from "~/i18n/navigation";
import { type Locale, routing } from "~/i18n/routing";

// Locale-agnostic paths that have real content. "/" is deliberately
// excluded — it's just the middleware's locale-redirect shell, the same
// filter the old @astrojs/sitemap config applied by hand
// (`filter: (page) => new URL(page).pathname !== "/"`).
const translatedPaths = ["/", "/veille"];

function absoluteUrl(locale: Locale, pathname: string): string {
  return new URL(getPathname({ locale, href: pathname }), siteConfig.url).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const translatedEntries: MetadataRoute.Sitemap = translatedPaths.flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, pathname),
      lastModified,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, absoluteUrl(loc, pathname)]),
        ),
      },
    })),
  );

  // French-only (LCEN legal notice) — no hreflang alternates, since
  // there's no other-language version to point at.
  const mentionsLegales: MetadataRoute.Sitemap = [
    { url: absoluteUrl("fr", "/mentions-legales"), lastModified },
  ];

  return [...translatedEntries, ...mentionsLegales];
}
