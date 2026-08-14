import { gsap } from "gsap";
import type * as THREE from "three";
import { onScrollState, type ScrollState } from "../scroll-state";
import type { FullscreenPass } from "./createFullscreenPass";
import { createRenderer } from "./createRenderer";

export interface StagePass {
  pass: FullscreenPass;
  /** Render target this pass writes into; omit/null to render straight to the screen. */
  target?: THREE.WebGLRenderTarget | null;
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
      stagePass.onFrame?.({ time, scroll: latestScroll });
      stagePass.pass.render(renderer, stagePass.target ?? null);
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
