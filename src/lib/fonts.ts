import localFont from "next/font/local";

// Same subset files @fontsource shipped as separate CSS partials in the
// Astro build (src/styles/app.css), now loaded through next/font/local
// instead of a plain `@import`: each subset becomes its own @font-face
// (next/font emits one per `src` entry, matching the earlier CSS
// 1:1), so glyph coverage — including the CJK subsets — is unchanged,
// while gaining automatic preloading and fallback-metric overrides
// (`adjustFontFallback`) that a plain CSS import doesn't provide.
export const fontSans = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-ext-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-ext-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-japanese-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-zen-kaku",
  display: "swap",
  fallback: ["Hiragino Kaku Gothic ProN", "Yu Gothic", "ui-sans-serif", "system-ui", "sans-serif"],
});

// Display-only serif, used sparingly (the one ornamental voice on the
// page) — same two weights and both scripts (Latin headings, CJK
// watermark glyphs) the site actually renders in font-serif.
export const fontSerif = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/shippori-mincho/files/shippori-mincho-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/shippori-mincho/files/shippori-mincho-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/shippori-mincho/files/shippori-mincho-japanese-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/shippori-mincho/files/shippori-mincho-japanese-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-shippori",
  display: "swap",
  fallback: ["Hiragino Mincho ProN", "Yu Mincho", "serif"],
});
