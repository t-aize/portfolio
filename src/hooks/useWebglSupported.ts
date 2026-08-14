import { useState } from "react";

function probeWebgl(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// Lazy useState initializer runs once on the client (and never during SSR,
// since it only runs at mount time), so no separate effect/hydration flip
// is needed the way useReducedMotion's media query needs one.
export function useWebglSupported(): boolean {
  const [supported] = useState(probeWebgl);
  return supported;
}
