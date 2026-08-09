/**
 * Single source of truth for "how fast is the page moving right now",
 * shared between the ink shader and the kinetic type layer so both react
 * to the same signal instead of each attaching its own Lenis listener —
 * which would double the per-frame work and risk the two drifting a frame
 * out of sync with each other.
 */
import { lenis } from "./lenis";

type Listener = (velocity: number) => void;

const listeners = new Set<Listener>();

// Lenis reports raw pixel velocity per scroll event, which spikes hard on
// trackpad flicks and is noisy frame to frame. Smoothing it exponentially
// gives consumers something that reads as "current scroll speed" rather
// than a jittery instantaneous number.
const SMOOTHING = 0.08;
const VELOCITY_CEILING = 40; // px/frame considered "fully turbulent" (1.0)

let smoothed = 0;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function normalize(rawSmoothed: number): number {
  return clamp01(Math.abs(rawSmoothed) / VELOCITY_CEILING);
}

lenis.on("scroll", () => {
  smoothed += (lenis.velocity - smoothed) * SMOOTHING;
  const normalized = normalize(smoothed);
  for (const listener of listeners) listener(normalized);
});

/** Subscribe to normalized (0..1) scroll velocity. Returns an unsubscribe fn. */
export function onScrollVelocity(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** One-off read, for callers that only need a value at init time. */
export function getSmoothedVelocity(): number {
  return normalize(smoothed);
}
