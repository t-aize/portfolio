/**
 * Single source of truth for "how is the page moving right now", shared
 * between the ink shader, the hero name's text-shadow fringe, and (from
 * HeroStage onward) any other pass that wants scroll-reactive uniforms —
 * one listener on gsap.ticker instead of each consumer attaching its own.
 */
import { gsap } from "gsap";
import { lenis } from "./lenis";

export interface ScrollState {
  /** 0..1, smoothed magnitude — same scale/meaning as the old exported value. */
  velocity: number;
  /** -1..1, signed and smoothed: which way the page is currently moving. */
  direction: number;
  /** lenis.scroll, in px. */
  offset: number;
}

type Listener = (state: ScrollState) => void;

const listeners = new Set<Listener>();

// Lenis reports raw pixel velocity, which spikes hard on trackpad flicks and
// is noisy frame to frame. Smoothing it exponentially gives consumers
// something that reads as "current scroll speed" rather than a jittery
// instantaneous number.
const SMOOTHING = 0.08;
const VELOCITY_CEILING = 40; // px/frame considered "fully turbulent" (1.0)

// Signed, smoothed px/frame. Read from gsap.ticker (not the Lenis 'scroll'
// event) so it keeps decaying after the user stops scrolling: Lenis emits
// 'scroll' only while it has something to report, so a listener gated on
// that event freezes on its last value instead of easing back to 0. Reading
// lenis.velocity itself on the ticker works because that property keeps
// updating (and decaying) every Lenis raf tick regardless of whether a
// 'scroll' event fires.
let smoothed = 0;

function clampSigned(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

gsap.ticker.add(() => {
  smoothed += (lenis.velocity - smoothed) * SMOOTHING;
  const direction = clampSigned(smoothed / VELOCITY_CEILING);
  const state: ScrollState = {
    velocity: Math.abs(direction),
    direction,
    offset: lenis.scroll,
  };
  for (const listener of listeners) listener(state);
});

/** Subscribe to the full scroll state. Returns an unsubscribe fn. */
export function onScrollState(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Back-compat wrapper for consumers that only care about the smoothed
 * magnitude (the hero name's CSS fringe) — spares them from destructuring
 * the full state for one field.
 */
export function onScrollVelocity(listener: (velocity: number) => void): () => void {
  return onScrollState((state) => listener(state.velocity));
}
