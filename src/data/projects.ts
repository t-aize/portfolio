export interface ProjectData {
  id: string;
  title: string;
  stack: string[];
  href: string | null;
}

export const projects: ProjectData[] = [
  {
    id: "odm",
    title: "ODM Monitoring Alstom",
    stack: ["Next.js", "tRPC", "Drizzle", "SQLite"],
    href: null,
  },
  {
    id: "aurum",
    title: "Aurum",
    stack: ["Bun", "TypeScript", "OpenTUI", "Effect"],
    href: null,
  },
  {
    id: "zen",
    title: "Zen",
    stack: ["Bun", "TypeScript", "Seyfert"],
    href: null,
  },
  {
    id: "borning",
    title: "Borning Challenge",
    stack: ["FastAPI", "Flutter", "MongoDB"],
    href: "https://github.com/t-aize/borning-challenge",
  },
];
