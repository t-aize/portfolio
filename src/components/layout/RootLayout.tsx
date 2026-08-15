import { HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { InkCursor } from "~/components/layout/InkCursor";
import { InkField } from "~/components/layout/InkField";
import { SmoothScroll } from "~/components/layout/SmoothScroll";

/**
 * The document shell: html/body, the always-mounted client effects
 * (Lenis, the ambient ink field, the ink cursor aura), and the slot each
 * route renders into. Kept out of routes/__root.tsx so that file stays
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
        <InkField />
        <InkCursor />
        <main className="flex-1">{children}</main>
        <Scripts />
      </body>
    </html>
  );
}
