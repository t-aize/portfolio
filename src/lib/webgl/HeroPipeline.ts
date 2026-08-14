import * as THREE from "three";
import compositeFragmentShader from "./composite/shaders/composite.frag?raw";
import { createFullscreenPass } from "./createFullscreenPass";
import { createHeroStage } from "./HeroStage";
import { createInkPass } from "./ink/InkScene";
import fullscreenVertexShader from "./shaders/fullscreen.vert?raw";
import { createHeroTextPass, type HeroTextTarget } from "./text/HeroTextPass";

export interface HeroPipelineHandle {
  ink: {
    /** Tween like `gsap.to(pipeline.ink.opacity, { value: 1, duration: 1.4 })`. */
    opacity: { value: number };
  };
  /** Resolves once every text mesh has laid out at least once and fonts are ready. */
  textReady: Promise<void>;
  destroy(): void;
}

// The ink fbm/curl simulation is the expensive part of this pipeline —
// capped the same way it always was (see the former InkScene.ts). The
// renderer itself now runs at native DPR (HeroStage's default) because the
// text pass, composited after it, needs that to stay sharp; decoupling ink
// into its own render target is what lets both be true at once instead of
// one policy fighting the other for the whole canvas — see the Netteté
// section of the hero WebGL mission.
const MAX_INK_PIXEL_RATIO = 1.75;

/**
 * Owns the hero's whole WebGL pipeline: one HeroStage (renderer, ticker,
 * resize, scroll-state), the ink render target and simulation, the
 * composite blit that upscales it to the screen, and the text pass drawn
 * on top. This is the only place that decides pass order.
 *
 * Returns null if WebGL isn't available, so the caller can fall back to
 * the static DOM.
 */
export function createHeroPipeline(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  textTargets: HeroTextTarget[],
): HeroPipelineHandle | null {
  const heroStage = createHeroStage(canvas, host);
  if (!heroStage) return null;
  const { addPass, destroy: destroyStage } = heroStage;

  const inkTarget = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });

  const ink = createInkPass();
  addPass({
    ...ink.stagePass,
    target: inkTarget,
    onResize: (renderer, cssWidth, cssHeight, dpr) => {
      const scale = Math.min(dpr, MAX_INK_PIXEL_RATIO);
      inkTarget.setSize(
        Math.max(1, Math.round(cssWidth * scale)),
        Math.max(1, Math.round(cssHeight * scale)),
      );
      ink.stagePass.onResize?.(renderer, cssWidth, cssHeight, dpr);
    },
  });

  const composite = createFullscreenPass({
    vertexShader: fullscreenVertexShader,
    fragmentShader: compositeFragmentShader,
    uniforms: { uSource: { value: inkTarget.texture } },
  });
  addPass({ pass: composite });

  const text = createHeroTextPass(textTargets);
  addPass({ ...text.stagePass, clear: false });

  function destroy() {
    destroyStage();
    inkTarget.dispose();
  }

  return { ink: { opacity: ink.uniforms.opacity }, textReady: text.ready, destroy };
}
