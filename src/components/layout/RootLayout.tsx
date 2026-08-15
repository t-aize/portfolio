import { HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Footer } from "~/components/layout/Footer";
import { ScrollRail } from "~/components/layout/ScrollRail";
import { SmoothScroll } from "~/components/layout/SmoothScroll";

/**
 * The document shell: html/body, the always-mounted client effects
 * (Lenis, the scroll rail), the slot each route renders into, and the
 * closing colophon. Kept out of routes/__root.tsx so that file stays
 * route config (head tags, the router's error/not-found wiring) rather
 * than markup.
 */
export function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col bg-cream text-ink">
        <SmoothScroll />
        <ScrollRail />
        <main className="flex-1">{children}</main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
