# Tom B. · Portfolio

Personal backend-developer portfolio, built with [Next.js](https://nextjs.org)
(App Router) and [React](https://react.dev): Server Components by default,
`"use client"` only on the sections that actually animate (GSAP scroll
reveals, Lenis smooth-scroll) or hold interactive state. The site has one
real content page (home, in sections), a "Veille" tech-watch article, and a
French-only legal-notice page — no server data, no forms, no application
routing to speak of.

Bilingual (FR default, EN), routed via [`next-intl`](https://next-intl.dev/)
with an always-prefixed locale (`/fr/...`, `/en/...`).

Migrated from an earlier Astro build — see `MIGRATION_NOTES.md` for the full
rationale and open questions from that migration, and `AGENTS.md` for a
condensed map of the codebase.

## Stack

- **Next.js 16** (App Router, Turbopack, React Compiler) + **React 19**
- **TypeScript 7**, strict
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **next-intl** for i18n/routing
- **GSAP 3** (`@gsap/react`, ScrollTrigger, SplitText) + **Lenis** for
  smooth-scroll
- **Biome** for lint + format
- **Bun** as the runtime and package manager
- **Vercel** for hosting, analytics, and speed insights

## Getting started

```bash
bun install
bun run dev
```

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Start the dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` / `lint:check` | Biome lint (write / check-only) |
| `bun run format` / `format:check` | Biome format (write / check-only) |
| `bun run check` | Biome check (lint + format + assist, write) |
| `bun run ci` | Biome check, CI mode (no writes, fails on any issue) |
| `bun run validate` | `ci` + `typecheck` + `build`, in that order |

## Deployment

Deployed on [Vercel](https://vercel.com) as a standard Next.js app (server
runtime, not a static export) — required for locale negotiation in
`src/proxy.ts`, per-route `generateMetadata`, and the dynamic OG images
under `app/[locale]/opengraph-image.tsx`.
