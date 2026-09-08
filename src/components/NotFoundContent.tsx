"use client";

import { ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

// `not-found.tsx` renders without props (Next.js convention), so the
// locale is read from the route params directly rather than through
// next-intl's context — that context isn't guaranteed to be mounted
// here, since an unrecognized locale segment 404s from the layout
// itself, before its provider renders.
const copy = {
  fr: { caption: "Page introuvable", back: "Retour à l’accueil" },
  en: { caption: "Page not found", back: "Back home" },
};

/**
 * The 404 in the same voice as the hero's signature: a large serif
 * mark grounded on a hairline rule, a small tracked caption, stated
 * plainly, no illustration. "無" (mu, "nothing") stands in for the
 * missing page the way "完" closes the footer's colophon.
 */
export function NotFoundContent() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === "en" ? "en" : "fr";
  const t = copy[locale];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center sm:px-16">
      <span aria-hidden="true" className="font-serif text-sm text-taupe">
        無
      </span>

      <h1 className="mt-2 font-serif text-6xl leading-none text-ink sm:text-8xl">404</h1>

      <div aria-hidden="true" className="mt-6 h-px w-44 bg-stone sm:mt-8 sm:w-56" />

      <p className="mt-4 text-xs tracking-[0.3em] text-taupe uppercase sm:text-sm">{t.caption}</p>

      <a
        href={`/${locale}`}
        className="mt-10 inline-flex items-center gap-1 text-xs tracking-[0.3em] text-taupe uppercase transition-colors hover:text-clay"
      >
        {t.back}
        <ArrowRight aria-hidden="true" size={12} strokeWidth={1.5} />
      </a>
    </div>
  );
}
