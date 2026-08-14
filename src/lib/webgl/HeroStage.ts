import { gsap } from "gsap";
import type * as THREE from "three";
import { onScrollState, type ScrollState } from "../scroll-state";
import { createRenderer } from "./createRenderer";

/**
 * The minimal shape HeroStage needs from anything it drives — satisfied
 * structurally by createFullscreenPass's return value, but also by
 * HeroTextPass, which owns a real Scene/PerspectiveCamera instead of a
 * fullscreen quad and has no business importing quad-pass types to prove it
 * fits.
 */
export interface StageRenderable {
  render(renderer: THREE.WebGLRenderer, target?: THREE.WebGLRenderTarget | null): void;
  destroy(): void;
}

export interface StagePass {
  pass: StageRenderable;
  /** Render target this pass writes into; omit/null to render straight to the screen. */
  target?: THREE.WebGLRenderTarget | null;
  /**
   * Whether HeroStage should clear `target` before this pass draws.
   * Defaults to true. Set to false when a pass needs to draw on top of
   * whatever a previous pass already put in the same target this frame —
   * e.g. the text pass drawing over the ink composite on the screen target:
   * both target the screen, so the second one clearing would erase the
   * first. (Renderer.autoClear is off stage-wide for exactly this reason —
   * per-target auto-clearing can't express "clear the first writer, not
   * the second".)
   */
  clear?: boolean;
  /** Called once per tick, before pass.render(). Update uTime/uVelocity/etc. here. */
  onFrame?: (ctx: { time: number; scroll: ScrollState }) => void;
  /**
   * Called once immediately on registration (if the host already has a
   * size) and again on every resize of `host`. This is where a pass resizes
   * or recreates a render target it owns — HeroStage only tells it the new
   * CSS size and device pixel ratio, it doesn't guess at what resolution
   * any given pass actually wants to render at.
   */
  onResize?: (
    renderer: THREE.WebGLRenderer,
    cssWidth: number,
    cssHeight: number,
    dpr: number,
  ) => void;
}

export interface HeroStageOptions {
  /**
   * Renderer pixel ratio policy, re-read on every resize. Defaults to the
   * native devicePixelRatio, since a text pass needs that to stay sharp.
   * A stage with no text pass yet (the ink-only bring-up before troika
   * lands) should pass a capped value here instead, to keep the existing
   * MAX_PIXEL_RATIO battery tradeoff until there's text to justify going
   * native.
   */
  getPixelRatio?: () => number;
}

export interface HeroStageHandle {
  renderer: THREE.WebGLRenderer;
  /**
   * Registers a pass, rendered in the order passes were added. Immediately
   * invokes its onResize once if `host` already has a laid-out size.
   */
  addPass(stagePass: StagePass): void;
  destroy(): void;
}

/**
 * Owns everything a hero WebGL pipeline needs exactly once, no matter how
 * many passes it ends up composing: the WebGLRenderer, the resize
 * observation, the single gsap.ticker subscription, and the single
 * scroll-state subscription. Individual passes (createFullscreenPass) stay
 * unaware of all of this — they just render when told to.
 *
 * Returns null if WebGL isn't available, before touching the DOM further,
 * so the caller can fall back cleanly.
 */
export function createHeroStage(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  options: HeroStageOptions = {},
): HeroStageHandle | null {
  const rendererHandle = createRenderer(canvas);
  if (!rendererHandle) return null;
  const { renderer, destroy: destroyRenderer } = rendererHandle;
  // Managed manually per StagePass instead (see `clear` above) — the
  // built-in autoClear can't distinguish "first pass writing to this
  // target this frame" from "second pass writing to the same target".
  renderer.autoClear = false;

  const getPixelRatio = options.getPixelRatio ?? (() => window.devicePixelRatio);
  const passes: StagePass[] = [];

  function resize() {
    const { clientWidth: cssWidth, clientHeight: cssHeight } = host;
    if (cssWidth === 0 || cssHeight === 0) return;
    const dpr = getPixelRatio();
    renderer.setPixelRatio(dpr);
    renderer.setSize(cssWidth, cssHeight, false);
    for (const stagePass of passes) stagePass.onResize?.(renderer, cssWidth, cssHeight, dpr);
  }

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  // Read once per frame rather than each pass subscribing individually —
  // that would re-run every listener's smoothing math per pass instead of
  // once per tick, and risks passes seeing different values within the same
  // frame if scroll-state fires between them.
  let latestScroll: ScrollState = { velocity: 0, direction: 0, offset: 0 };
  const unsubscribeScroll = onScrollState((state) => {
    latestScroll = state;
  });

  const tick = (time: number) => {
    for (const stagePass of passes) {
      const target = stagePass.target ?? null;
      stagePass.onFrame?.({ time, scroll: latestScroll });
      if (stagePass.clear ?? true) {
        renderer.setRenderTarget(target);
        renderer.clear(true, true, true);
      }
      stagePass.pass.render(renderer, target);
    }
  };
  gsap.ticker.add(tick);

  function addPass(stagePass: StagePass) {
    passes.push(stagePass);
    const { clientWidth: cssWidth, clientHeight: cssHeight } = host;
    if (cssWidth > 0 && cssHeight > 0) {
      stagePass.onResize?.(renderer, cssWidth, cssHeight, getPixelRatio());
    }
  }

  function destroy() {
    gsap.ticker.remove(tick);
    resizeObserver.disconnect();
    unsubscribeScroll();
    for (const stagePass of passes) stagePass.pass.destroy();
    destroyRenderer();
  }

  return { renderer, addPass, destroy };
}
