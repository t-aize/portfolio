<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project: Tom B. · Portfolio

Personal backend-developer portfolio. Migrated from Astro 7 (React islands) to
Next.js 16 App Router in 2026 — see `MIGRATION_NOTES.md` for the full history
and open questions from that migration.

## Stack

- **Next.js 16** (App Router, Turbopack, React Compiler enabled), **React 19**.
- **Bun** as the only runtime/package manager (`bun install`, `bun run <script>`
  — never npm/pnpm/yarn; lockfile is `bun.lock`).
- **TypeScript 7** (native Go compiler), strict, alias `~/*` → `./src/*`.
- **Tailwind CSS v4** via `@tailwindcss/postcss` (not `@tailwindcss/vite` —
  that's Vite/Astro-only).
- **next-intl** for i18n: locales `fr` (default) and `en`, always prefixed
  (`localePrefix: "always"`), config in `src/i18n/`.
- **Biome** for lint + format (`bun run check`/`ci`/`lint`/`format`).
- **GSAP 3 + `@gsap/react` + Lenis** for animation/smooth-scroll, client-only.
- **Vercel** for hosting, analytics (`@vercel/analytics`), and speed insights.

## Architecture

- No `src/app/layout.tsx`. The root layout lives at
  `src/app/[locale]/layout.tsx` (renders `<html>`/`<body>`) — this is the
  pattern Next.js and next-intl both document for an i18n app where every
  route sits under a `[locale]` segment. `src/app/global-not-found.tsx`
  (behind `experimental.globalNotFound` in `next.config.ts`) exists
  specifically because of this: it's the one 404 path Next.js resolves
  *before* the `[locale]` segment even matches, so it can't reuse the normal
  layout tree or next-intl's React context.
- `src/middleware.ts` doesn't exist — Next 16 renamed that convention to
  `src/proxy.ts` (same runtime, same next-intl `createMiddleware` call).
- Locale switching, hreflang, and hreflang-adjacent alternates are entirely
  next-intl/Metadata-API-driven: `src/i18n/routing.ts` (routing config,
  `alternateLinks: false` because it doesn't know about the
  `/mentions-legales` FR-only carve-out), `src/i18n/navigation.ts` (typed
  `Link`/`usePathname`/`getPathname`), `src/lib/page-metadata.ts`
  (`buildAlternates`, used by every page's `generateMetadata`).
- `src/config/site.ts` centralizes email/GitHub/LinkedIn/site URL — import
  from there, never hardcode them again.
- `src/hooks/use-scroll-reveal.ts` is the one place the
  reduced-motion-check → `gsap.set` → `gsap.timeline`(+ optional
  `ScrollTrigger`) pattern lives. Every section (`Hero`, `About`, `Projects`,
  `Experience`, `Contact`, `Veille`) calls it instead of repeating the
  pattern inline.
- `/mentions-legales` only exists for `locale === "fr"` (LCEN is French law).
  Its `page.tsx` calls `notFound()` for any other locale — don't add an
  `/en/mentions-legales` translation.
- OG/Twitter images are generated per locale via `next/og`
  (`src/lib/og-image.tsx` + `app/[locale]/opengraph-image.tsx` /
  `twitter-image.tsx`, with a bespoke pair for `/veille`) — there's no
  static `public/og-image.png` anymore.
- Fonts (`@fontsource/shippori-mincho`, `@fontsource/zen-kaku-gothic-new`)
  load through `next/font/local` (`src/lib/fonts.ts`), pointed directly at
  the `.woff2` files inside `node_modules/@fontsource/*` — one `src` entry
  per subset (latin/latin-ext/japanese), mirroring the multi-`@font-face`
  shape the old plain CSS `@import`s produced, so glyph coverage (incl. CJK)
  didn't change.

## Gotchas

- GSAP/Lenis code must stay behind `"use client"` — `src/lib/gsap.ts` only
  registers plugins in the browser, but every importer still needs the
  directive for Next's Server/Client boundary.
- `next-intl`'s typed `t()` needs data `id` fields to be literal string
  unions (see `src/data/*.ts`), not plain `string`, or `t(`namespace.${id}`)`
  fails to type-check.
- Don't reintroduce a `<meta>`/OG/JSON-LD tag by hand in a page — everything
  goes through `generateMetadata` (per-page) or the root layout's
  `generateMetadata` (site-wide defaults). See §6 of the original migration
  prompt in `MIGRATION_NOTES.md` for the full rationale.
