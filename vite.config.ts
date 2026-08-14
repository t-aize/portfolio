import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// Nitro preset controls only the deployment runtime the server build targets
// (Node, Vercel, Netlify, Cloudflare, Deno, Bun, ...); routes, loaders, and
// server functions are unaffected by this choice. Override at build time,
// e.g. `DEPLOY_PRESET=cloudflare pnpm build`.
const preset = process.env.DEPLOY_PRESET ?? "node";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
    }),
    viteReact(),
    nitro({
      preset,
    }),
  ],
});
