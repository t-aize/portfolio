# Migration notes — Astro → Next.js

This documents the hypotheses made where the migration brief was
underspecified, the deviations from its literal file tree, and what's left
for the site's author to verify or decide. Read alongside `AGENTS.md` for the
condensed "how this project is built" summary.

## Hypotheses / assumptions made without asking

1. **`bun@1.4.2` couldn't actually be installed in this sandbox** (only
   `1.3.11` was available). `package.json`'s `packageManager` field is still
   pinned to `bun@1.4.2` as the brief specified — Corepack-style, it's a
   declaration of the intended version, not a hard requirement of what ran
   here. Everything was built and tested with `1.3.11`; nothing in the
   config is version-specific, so this should be a non-issue once run
   somewhere `1.4.2` is installable.

2. **`bunx taze` couldn't reach the npm registry from this sandbox**
   (`Timeout requesting "<package>"` for every dependency, likely a proxy
   quirk specific to this environment). Freshness was instead verified by
   diffing `bun install`'s resolved versions against
   `npm view <pkg> dist-tags.latest` for every dependency by hand — all of
   them (Next 16.3.4, next-intl 4.14.2, Tailwind 4.3.3, Biome 2.5.12,
   TypeScript 7.0.2, GSAP 3.15.0, Lenis 1.3.26, …) already matched latest.
   Re-run `bunx taze@latest` yourself once you have registry access to
   confirm nothing has moved since.

3. **No `src/app/layout.tsx`.** The brief's tree (§4) lists one, but Next.js
   requires exactly one `<html>`/`<body>` in the render tree, and
   `src/app/[locale]/layout.tsx` already provides it — a second one above it
   would be a nested-`<html>` build error. This is also the structure
   Next.js's own i18n guide and next-intl's official examples use when
   every route lives under a locale segment. `MIGRATION_NOTES` calls it out
   explicitly since it's the one place this repo's tree diverges from the
   brief's.

4. **`src/middleware.ts` → `src/proxy.ts`.** Next.js 16 deprecated the
   `middleware.ts` convention in favor of `proxy.ts` (identical runtime and
   signature, per Next's own migration notes and the codemod it ships:
   `npx @next/codemod middleware-to-proxy`). Since this migration targets
   Next 16 as a fresh baseline, the new name was used from the start instead
   of adding an already-deprecated file.

5. **`next-intl`'s `alternateLinks` middleware feature is disabled**
   (`src/i18n/routing.ts`). By default next-intl's middleware sets a `Link`
   response header with hreflang alternates for every request, assuming a
   path exists in every locale — untrue for `/mentions-legales` (FR-only).
   Left on, it would emit exactly the "bogus hreflang to a page that
   doesn't exist" the brief explicitly says to avoid (§6.2). The correct,
   carve-out-aware hreflang still ships via each page's `generateMetadata`
   (`buildAlternates` in `src/lib/page-metadata.ts`) — verified by curling
   both the HTTP headers and the rendered `<head>` for `/fr/mentions-legales`.

6. **`app/global-not-found.tsx` was added**, gated behind
   `experimental.globalNotFound` in `next.config.ts` — not in the brief's
   tree at all. Discovered by testing: because the root layout sits on the
   `[locale]` dynamic segment, a URL that matches *no* route at all (e.g.
   `/fr/nope`) resolves to Next's top-level 404 boundary *before* the
   `[locale]` segment is considered, so `app/[locale]/not-found.tsx` never
   runs for it — that file only fires for an explicit `notFound()` call
   inside an already-matched route (which is exactly how the
   `/en/mentions-legales` case works). Without `global-not-found.tsx`, a
   plain wrong URL fell back to Next's generic, unstyled 404 boilerplate —
   a real regression versus the Astro site, which had a 404 for every path.
   `globalNotFound` is documented as experimental in Next 16 and is
   precisely the case Next's own docs describe it for ("your root layout is
   defined using top-level dynamic segments"). Worth re-checking when it
   graduates out of experimental.

7. **Fonts**: `next/font/local`'s public API in this Next.js version has no
   `unicode-range` support, so a single `localFont()` call can't cleanly
   combine a family's latin, latin-ext, and Japanese subsets the way the
   Astro build's plain `@import`s did (each `@fontsource/*` subset file is
   its own `@font-face`, sharing a family name, differentiated only by
   which glyphs each file actually contains). The fix: `src/lib/fonts.ts`
   passes every subset file as a separate `src` entry — next/font/local
   emits one `@font-face` per entry, which reproduces the exact same
   multi-face shape the old CSS produced, so glyph coverage (including the
   CJK watermark characters) is unchanged. Verified visually: screenshots
   of Hero/About/Experience/Veille/Footer all render their kanji correctly.

8. **OG images**: bespoke art for the homepage (per locale) and `/veille`
   (per locale) via `next/og`; `/mentions-legales` inherits the
   locale-level default rather than getting its own — a scope call given
   its minor SEO weight as a legal-notice page, not a technical limitation.

9. **`mentionsLegales` i18n namespace**: the Astro page hardcoded all its
   copy directly in JSX/HTML. It's now a proper `fr.json`-only namespace
   (`mentionsLegales.*`) instead of inline strings, for consistency with
   every other page — no `en` counterpart was added, matching the page's
   French-only nature.

10. **`rail.up` / `rail.down`** dictionary keys were carried over into
    `messages/{fr,en}.json` even though grep confirms no component
    currently reads them — they were already unused in the Astro
    dictionary. Left in rather than deleted, since removing content wasn't
    asked for and "no content regression" was explicit; worth deleting in
    a follow-up if confirmed genuinely dead.

11. **Data `id` fields became literal string unions** (`ProjectId`,
    `ExperienceId`, `AlgorithmId`, `TimelineId`, `SourceId` in
    `src/data/*.ts`), rather than plain `string`. next-intl's typed
    `t(`namespace.${id}`)` calls require it to type-check, and it's a
    genuine improvement over the Astro version's unchecked
    `Record<string, string>` dictionary lookups (a typo in an `id` is now a
    compile error, not a silently-blank string at runtime).

12. **Footer's manual `document.cookie = "lang=…"` write was removed.**
    next-intl's middleware now sets the same `lang` cookie automatically
    (name and 1-year `maxAge` configured to match the old behavior) on
    every request that resolves a locale, making the client-side write
    redundant.

## Tooling / repo-hygiene changes (audit §7 items)

- 404 triplication (§7.1) → one `app/[locale]/not-found.tsx` (+ the
  `global-not-found.tsx` case above, which the Astro site's architecture
  didn't have an equivalent for).
- `lib/gsap.ts`'s stale TanStack Start comment (§7.2) → rewritten for
  Next.js Server/Client Components.
- Client-side locale-redirect script (§7.3) → `src/proxy.ts` (next-intl
  middleware), no JS shipped for it at all now.
- Duplicated contact/social links (§7.4) → `src/config/site.ts`.
- Astro-only deps removed (§7.5): `astro`, `@astrojs/react`,
  `@astrojs/sitemap`. Sitemap is now `app/sitemap.ts`.
- `@tailwindcss/vite` → `@tailwindcss/postcss` + `postcss.config.mjs`
  (§7.6).
- Fonts moved off plain `@import` onto `next/font/local` (§7.7 — see
  hypothesis 7 above for how subsetting was preserved).
- Repeated GSAP reveal boilerplate (§7.8) → `src/hooks/use-scroll-reveal.ts`,
  used by every animated section.
- Footer desktop/mobile link duplication (§7.9): the link *data*
  (`footerLinks()` in `src/components/layout/Footer.tsx`) is now a single
  array mapped twice; the two DOM structures (flat row vs. bottom sheet)
  still diverge, same rationale as the original comment (fixed-position
  sheet vs. inline row differ too much for one shared markup block).
- `package.json` scripts (§7.10) → Next.js + Bun equivalents; `bun.lock`
  replaces `pnpm-lock.yaml`/`pnpm-workspace.yaml`; `packageManager` field
  updated. Also updated to match: `.github/workflows/ci.yml` (Bun setup
  action, `.next/` artifact path), `.github/dependabot.yml`
  (`package-ecosystem: "bun"` — **please confirm** GitHub's Dependabot
  actually supports this ecosystem value on your account/plan; fall back to
  `"npm"` if it rejects the config, since `bun.lock` is still npm-lockfile
  compatible enough for Dependabot's npm parser in most setups), Husky
  hooks, `.vscode/extensions.json`, `.zed/settings.json`, `.editorconfig`,
  `.gitattributes`, `.gitignore`.
- `tsconfig.json` (§7.11) → the native config `create-next-app` itself
  generates for a strict TypeScript 7 + App Router project (`strict: true`,
  `moduleResolution: "bundler"`, `jsx: "react-jsx"`), alias `~/*` kept.
- Hand-written `<head>` tags (§7.12) → `generateMetadata` per page/layout,
  `app/sitemap.ts`, `app/robots.ts`, `app/[locale]/opengraph-image.tsx`.

## What's left to verify manually

The build (`bun run build`), typecheck (`bun run typecheck`), and lint
(`bun run ci`) all pass, and `bun run start` was smoke-tested locally
(screenshots taken of `/fr`, `/en`, `/fr/veille`, `/fr/mentions-legales`,
`/fr/nope`, the mobile footer sheet, and both locale OG images — all match
the original design). Still worth doing before calling this done:

- [ ] **Visual parity pass** on an actual deployed preview, FR and EN, at a
      few breakpoints — this session verified via local screenshots only.
- [ ] **Animations**: scroll-triggered reveals, the Hero canvas pointer
      effect, and `prefers-reduced-motion` were all sanity-checked, but a
      human pass on real hardware (trackpad/touch) is worth it.
- [ ] **Sitemap** (`/sitemap.xml`) and **robots.txt** (`/robots.txt`) — both
      generate correctly locally; re-check the absolute URLs once deployed
      to the real `tombcode.vercel.app` domain.
- [ ] **hreflang** — verified via curl (`<link rel="alternate">` in
      `<head>`, no `Link` header) for home, veille, and the
      mentions-legales carve-out; re-run
      [Google's Rich Results Test](https://search.google.com/test/rich-results)
      and a hreflang checker against the live URL.
- [ ] **OG image per locale** — rendered and visually checked for home (FR
      screenshot in this session) and `/veille` (EN screenshot); check
      `/mentions-legales`'s inherited default too, and paste a live URL
      into Facebook's/Twitter's card debuggers once deployed (localhost
      previews don't work there).
- [ ] **Lighthouse / PageSpeed** — not run in this sandbox (no real browser
      perf harness available); compare against the Astro site's baseline
      once there's a live preview URL for both.
- [ ] **Dependabot config** — see the `package-ecosystem: "bun"` note above.
- [ ] **`bun@1.4.2`** — confirm it installs cleanly wherever this actually
      gets built/deployed; nothing here is tied to `1.3.11` specifically.
