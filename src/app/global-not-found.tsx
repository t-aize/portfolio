import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { fontSans, fontSerif } from "~/lib/fonts";
import "~/app/globals.css";

export const metadata: Metadata = {
  title: "404 · Tom B. · Portfolio",
};

// Next.js requires a full HTML document here (bypasses the app's normal
// layout tree entirely — see next.config.ts). It fires for a path that
// doesn't match any route at all, e.g. /fr/nope: the [locale] segment
// resolves, but nothing under it does, and that's a step earlier than
// where app/[locale]/not-found.tsx (rendered for an explicit notFound()
// call, e.g. an unrecognized locale or /en/mentions-legales) can help.
// The locale still comes from next-intl's proxy, via the request header
// it sets while resolving the URL — no provider is mounted this far out,
// so the fr/en copy is inlined rather than pulled from the message files.
const copy = {
  fr: { caption: "Page introuvable", back: "Retour à l’accueil" },
  en: { caption: "Page not found", back: "Back home" },
};

export default async function GlobalNotFound() {
  const headerList = await headers();
  const locale = headerList.get("x-next-intl-locale") === "en" ? "en" : "fr";
  const t = copy[locale];

  return (
    <html lang={locale} className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body className="flex min-h-dvh flex-col bg-cream text-ink">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center sm:px-16">
          <span aria-hidden="true" className="font-serif text-sm text-taupe">
            無
          </span>

          <h1 className="mt-2 font-serif text-6xl leading-none text-ink sm:text-8xl">404</h1>

          <div aria-hidden="true" className="mt-6 h-px w-44 bg-stone sm:mt-8 sm:w-56" />

          <p className="mt-4 text-xs tracking-[0.3em] text-taupe uppercase sm:text-sm">
            {t.caption}
          </p>

          <a
            href={`/${locale}`}
            className="mt-10 inline-flex items-center gap-1 text-xs tracking-[0.3em] text-taupe uppercase transition-colors hover:text-clay"
          >
            {t.back}
            <ArrowRight aria-hidden="true" size={12} strokeWidth={1.5} />
          </a>
        </div>
      </body>
    </html>
  );
}
