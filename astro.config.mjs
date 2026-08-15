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
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
