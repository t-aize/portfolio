import { getTranslations } from "next-intl/server";
import type { Locale } from "~/i18n/routing";
import { ogImageContentType, ogImageSize, renderOgImage } from "~/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const [meta, hero] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getTranslations({ locale, namespace: "hero" }),
  ]);

  return renderOgImage({
    locale,
    kanji: "完",
    title: meta("title"),
    eyebrow: hero("subtitle"),
  });
}
