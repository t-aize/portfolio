import { createFileRoute } from "@tanstack/react-router";
import { HeroIntro } from "~/components/HeroIntro";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <section className="flex min-h-[80vh] flex-col items-start justify-center">
      <HeroIntro />
    </section>
  );
}
