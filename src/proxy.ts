import createMiddleware from "next-intl/middleware";
import { routing } from "~/i18n/routing";

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (same
// runtime, same signature) — next-intl's request handler slots in
// unchanged. This is also what turns "/" into a redirect to the
// visitor's preferred locale, replacing the old client-side
// cookie/navigator.languages script (src/pages/index.astro) with
// server-side negotiation.
//
// `routing.alternateLinks` (set in i18n/routing.ts) turns off next-intl's
// default `Link` response header — see the comment there for why.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
