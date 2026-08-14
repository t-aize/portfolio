import { createFileRoute } from "@tanstack/react-router";
import { InkBackground } from "~/components/ink/InkBackground";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <InkBackground />
      <h1 data-ink-mask className="text-2xl font-semibold">
        Hello World
      </h1>
    </>
  );
}
