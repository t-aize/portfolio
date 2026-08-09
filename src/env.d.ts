/// <reference types="astro/client" />

// Vite's built-in `?raw` import suffix works on any file extension with no
// extra plugin — these two declarations just tell TypeScript what comes
// back, since it has no idea what a `.frag` or `.vert` file is otherwise.
declare module "*.frag?raw" {
  const src: string;
  export default src;
}

declare module "*.vert?raw" {
  const src: string;
  export default src;
}
