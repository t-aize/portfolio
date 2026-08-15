import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "~/components/Hero";
import { Projects } from "~/components/Projects";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Projects />
    </>
  );
}
