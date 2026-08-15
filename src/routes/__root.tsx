import { createRootRoute, Outlet } from "@tanstack/react-router";
import { RootLayout } from "~/components/layout/RootLayout";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width" },
      { title: "Tom B. · Portfolio" },
      { name: "description", content: "Portfolio de développeur backend." },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}
