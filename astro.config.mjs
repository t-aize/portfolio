// @ts-check

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://tombcode.vercel.app",

  vite: {
    plugins: [tailwindcss()],
    build: {
      // The three.js vendor chunk (WebGL hero effects) is lazy-loaded via
      // dynamic import() and never blocks initial page load, so its size
      // alone isn't a performance concern worth warning about.
      chunkSizeWarningLimit: 600,
    },
  },

  integrations: [sitemap(), react()],
});
