import { getTranslations } from "next-intl/server";
import type { Locale } from "~/i18n/routing";
import { ogImageContentType, ogImageSize, renderOgImage } from "~/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "veille" });

  return renderOgImage({
    locale,
    kanji: "暗号",
    title: t("title"),
    eyebrow: t("eyebrow"),
  });
}
