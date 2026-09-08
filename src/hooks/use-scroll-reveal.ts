import type { RefObject } from "react";
import { gsap, useGSAP } from "~/lib/gsap";

export interface RevealStep {
  targets: gsap.TweenTarget;
  /** Initial (hidden) state, applied before the timeline runs. */
  from: gsap.TweenVars;
  /** Animated-to (settled) state. */
  to: gsap.TweenVars;
  /** Timeline position of this step, e.g. "-=0.5". */
  position?: gsap.Position;
}

interface UseScrollRevealOptions {
  /** Element the GSAP context is scoped to (for auto-revert on unmount). */
  scope: RefObject<Element | null>;
  /**
   * Builds the reveal steps. Runs once per (re-)run of the effect, in
   * both the reduced-motion and animated paths, so it's also the right
   * place to create anything the steps need (e.g. a SplitText instance).
   * Returning null/an empty array skips the effect entirely.
   */
  getSteps: () => RevealStep[] | null | undefined;
  /** ScrollTrigger target; omit for an immediate (non-scroll-gated) reveal. */
  trigger?: RefObject<Element | null> | (() => Element | null | undefined);
  start?: string;
  delay?: number;
}

/**
 * Common shape behind every scroll-in reveal on the site (Hero, About,
 * Projects, Experience, Contact, Veille): check
 * `prefers-reduced-motion`, `gsap.set` the hidden state, then animate to
 * the settled state — optionally gated behind a ScrollTrigger. Reduced
 * motion just clears whatever inline styles GSAP would otherwise set,
 * rather than re-stating each property's resting value by hand.
 */
export function useScrollReveal({
  scope,
  getSteps,
  trigger,
  start = "top 75%",
  delay,
}: UseScrollRevealOptions) {
  useGSAP(
    () => {
      const steps = getSteps();
      if (!steps || steps.length === 0) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        for (const step of steps) {
          gsap.set(step.targets, { clearProps: "all" });
        }
        return;
      }

      for (const step of steps) {
        gsap.set(step.targets, step.from);
      }

      const triggerEl = typeof trigger === "function" ? trigger() : trigger?.current;
      const timeline = gsap.timeline(
        triggerEl ? { scrollTrigger: { trigger: triggerEl, start }, delay } : { delay },
      );
      for (const step of steps) {
        timeline.to(step.targets, step.to, step.position);
      }
    },
    { scope },
  );
}
