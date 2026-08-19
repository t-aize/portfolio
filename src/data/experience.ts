export interface ExperienceData {
  id: string;
  stack: string[];
}

// Oldest to newest — same chronological-ascending convention as
// src/data/veille.ts's timeline. Titles and periods are translatable
// (only "nyxo.js" happens to be a proper noun), so they live in the
// dictionary, keyed by id, rather than here.
export const experience: ExperienceData[] = [
  { id: "mairie", stack: ["Windows", "Networking", "Support"] },
  { id: "nyxo", stack: ["TypeScript", "Node.js", "Discord API"] },
  { id: "freelance", stack: ["TypeScript", "Next.js", "PostgreSQL"] },
  { id: "alstom", stack: ["Next.js", "tRPC", "Drizzle"] },
];
