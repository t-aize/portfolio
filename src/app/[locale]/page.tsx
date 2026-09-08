import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { About } from "~/components/About";
import { Contact } from "~/components/Contact";
import { Experience } from "~/components/Experience";
import { Hero } from "~/components/Hero";
import { Projects } from "~/components/Projects";
import type { Locale } from "~/i18n/routing";
import { buildAlternates } from "~/lib/page-metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // Title/description already match the root layout's defaults — only
  // the per-path fields (canonical, hreflang, og:url) need overriding.
  const alternates = buildAlternates({ locale, pathname: "/" });

  return {
    alternates,
    openGraph: { url: alternates.canonical },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </>
  );
}
