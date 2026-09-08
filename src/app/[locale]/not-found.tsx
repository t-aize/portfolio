import type { Metadata } from "next";
import { NotFoundContent } from "~/components/NotFoundContent";

// Identical in both locales in the original dictionaries — no need for
// per-locale metadata here (not-found.tsx renders without props, so a
// dynamic title would need a request-time lookup anyway).
export const metadata: Metadata = {
  title: "404 · Tom B. · Portfolio",
};

// Replaces the three near-identical Astro pages (src/pages/404.astro,
// fr/404.astro, en/404.astro — only `lang` and the back-link href ever
// differed) with one file; the locale-specific caption/back text lives
// in the client child, read from the route params.
export default function NotFound() {
  return <NotFoundContent />;
}
