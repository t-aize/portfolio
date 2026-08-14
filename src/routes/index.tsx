import { createFileRoute } from "@tanstack/react-router";
import { HeroIntro } from "~/components/HeroIntro";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <HeroIntro />;
}
