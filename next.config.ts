import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // The root layout lives on a dynamic segment (app/[locale]/layout.tsx,
    // no plain app/layout.tsx) — exactly the case Next's docs call out as
    // needing global-not-found instead of a plain root not-found.tsx,
    // since there's no single static layout to compose a 404 page from.
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
