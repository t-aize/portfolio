import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Veille } from "~/components/Veille";
import type { Locale } from "~/i18n/routing";
import { buildAlternates } from "~/lib/page-metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "veille" });
  const alternates = buildAlternates({ locale, pathname: "/veille" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates,
    openGraph: { url: alternates.canonical },
  };
}

export default async function VeillePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Veille />;
}
