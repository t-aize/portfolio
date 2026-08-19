import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  // Nothing on this site needs per-request rendering — no server functions,
  // no data loading, no mutations. Static output means `dist/` is plain
  // HTML/CSS/JS, deployable to any static host with no server runtime.
  output: "static",
  site: "https://tombcode.vercel.app",
  srcDir: "src",
  server: { port: 3000 },
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "en"],
    routing: {
      // Both locales live under an explicit prefix (/fr, /en) — no bare
      // French root. Astro's own auto-redirect for "/" is turned off
      // because src/pages/index.astro handles it instead, with a plain
      // client-side redirect (no server/edge runtime required, so it
      // works on any static host, not just Vercel).
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "fr",
        locales: { fr: "fr-FR", en: "en-US" },
      },
      // "/" has no content of its own — it's just the client-side
      // redirect shell — so it doesn't belong in the sitemap.
      filter: (page) => new URL(page).pathname !== "/",
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
