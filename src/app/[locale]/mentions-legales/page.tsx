import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "~/config/site";
import { Link } from "~/i18n/navigation";
import type { Locale } from "~/i18n/routing";
import { buildAlternates } from "~/lib/page-metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "fr") return {};

  const t = await getTranslations({ locale, namespace: "mentionsLegales" });

  // French-only by nature (LCEN is French law) — no English counterpart,
  // hence `translated: false` rather than a bogus /en/mentions-legales
  // hreflang link.
  const alternates = buildAlternates({ locale, pathname: "/mentions-legales", translated: false });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates,
    openGraph: { url: alternates.canonical },
  };
}

export default async function MentionsLegalesPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "fr") notFound();

  const t = await getTranslations("mentionsLegales");

  return (
    <article className="mx-auto max-w-3xl px-8 py-16 sm:px-16 sm:py-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs tracking-[0.3em] text-taupe uppercase transition-colors hover:text-clay"
      >
        <ArrowLeft aria-hidden="true" size={12} strokeWidth={1.5} />
        {t("backHome")}
      </Link>

      <div className="mt-10 sm:mt-14">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="font-serif text-base text-taupe">
            法
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-stone/60" />
          <span className="text-xs tracking-[0.35em] text-taupe uppercase">{t("eyebrow")}</span>
        </div>

        <h1 className="mt-6 font-serif text-4xl leading-tight text-ink sm:text-5xl">
          {t("title")}
        </h1>
      </div>

      <div className="mt-16 flex flex-col sm:mt-20">
        <section className="border-b border-stone/60 py-8 first:pt-0">
          <h2 className="text-xs tracking-[0.35em] text-taupe uppercase">{t("editor.heading")}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-taupe sm:text-base">
            {t("editor.paragraph")}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-taupe sm:text-base">
            {t("editor.contact")}{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="underline transition-colors hover:text-clay"
            >
              {siteConfig.email}
            </a>
          </p>
        </section>

        <section className="border-b border-stone/60 py-8">
          <h2 className="text-xs tracking-[0.35em] text-taupe uppercase">
            {t("publicationDirector.heading")}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-taupe sm:text-base">
            {t("publicationDirector.paragraph")}
          </p>
        </section>

        <section className="border-b border-stone/60 py-8">
          <h2 className="text-xs tracking-[0.35em] text-taupe uppercase">{t("hosting.heading")}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-taupe sm:text-base">
            {t("hosting.name")}
            <br />
            {t("hosting.address")}
            <br />
            {t("hosting.cityCountry")}
          </p>
        </section>

        <section className="py-8 last:border-b-0">
          <h2 className="text-xs tracking-[0.35em] text-taupe uppercase">
            {t("intellectualProperty.heading")}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-taupe sm:text-base">
            {t("intellectualProperty.paragraph")}
          </p>
        </section>
      </div>
    </article>
  );
}
