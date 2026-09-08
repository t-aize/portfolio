import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "~/i18n/routing";

export const ogImageSize = { width: 1200, height: 630 } as const;
export const ogImageContentType = "image/png" as const;

const fontsPromise = Promise.all([
  readFile(
    join(
      process.cwd(),
      "node_modules/@fontsource/shippori-mincho/files/shippori-mincho-latin-600-normal.woff",
    ),
  ),
  readFile(
    join(
      process.cwd(),
      "node_modules/@fontsource/shippori-mincho/files/shippori-mincho-japanese-600-normal.woff",
    ),
  ),
  readFile(
    join(
      process.cwd(),
      "node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-400-normal.woff",
    ),
  ),
]);

const palette = {
  cream: "#f3f0e7",
  ink: "#463f3a",
  taupe: "#706760",
  stone: "#bcb8b1",
};

interface OgImageProps {
  locale: Locale;
  kanji: string;
  title: string;
  eyebrow: string;
}

/**
 * Same kakemono voice as the rest of the site — cream ground, a hairline
 * rule, one oversized watermark kanji bleeding off the edge (as in
 * About/Experience/Footer) — rather than a generic title-card template.
 */
export async function renderOgImage({ locale, kanji, title, eyebrow }: OgImageProps) {
  const [shipporiLatin, shipporiJapanese, zenKakuLatin] = await fontsPromise;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "72px 88px",
        backgroundColor: palette.cream,
        fontFamily: "Zen Kaku Gothic New",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: -40,
          transform: "translateY(-50%)",
          fontFamily: "Shippori Mincho",
          fontSize: 460,
          lineHeight: 1,
          color: "rgba(70, 63, 58, 0.06)",
          display: "flex",
        }}
      >
        {kanji}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 1, backgroundColor: palette.stone, display: "flex" }} />
        <span
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: palette.taupe,
          }}
        >
          {eyebrow}
        </span>
      </div>

      <h1
        style={{
          margin: "24px 0 0",
          fontFamily: "Shippori Mincho",
          fontWeight: 600,
          fontSize: 88,
          lineHeight: 1.1,
          color: palette.ink,
          display: "flex",
          maxWidth: 900,
        }}
      >
        {title}
      </h1>

      <div
        style={{
          marginTop: 40,
          width: 220,
          height: 1,
          backgroundColor: palette.stone,
          display: "flex",
        }}
      />

      <span
        style={{
          marginTop: 24,
          fontSize: 20,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: palette.taupe,
        }}
      >
        tombcode.vercel.app · {locale.toUpperCase()}
      </span>
    </div>,
    {
      ...ogImageSize,
      fonts: [
        { name: "Shippori Mincho", data: shipporiLatin, weight: 600, style: "normal" },
        { name: "Shippori Mincho", data: shipporiJapanese, weight: 600, style: "normal" },
        { name: "Zen Kaku Gothic New", data: zenKakuLatin, weight: 400, style: "normal" },
      ],
    },
  );
}
