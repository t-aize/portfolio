import * as THREE from "three";
import compositeFragmentShader from "./composite/shaders/composite.frag?raw";
import { createFullscreenPass } from "./createFullscreenPass";
import { createHeroStage } from "./HeroStage";
import { createInkPass } from "./ink/InkScene";
import fullscreenVertexShader from "./shaders/fullscreen.vert?raw";
import { createHeroTextPass, type HeroTextTarget } from "./text/HeroTextPass";
import blurFragmentShader from "./text/shaders/blur.frag?raw";

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

// fieldRT (and the temp buffer feeding its second blur pass) is quarter
// resolution — the blur only needs to describe a soft gradient around each
// glyph, not preserve detail, and the downsampling itself is most of what
// gives the two 9-tap blur passes their effective reach.
const FIELD_DOWNSAMPLE = 4;

function makeRedTarget(): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(1, 1, {
    format: THREE.RedFormat,
    type: THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
}

/**
 * Owns the hero's whole WebGL pipeline: one HeroStage (renderer, ticker,
 * resize, scroll-state) and every pass's render targets. This is the only
 * place that decides pass order:
 *
 *   1. text mask  -> maskRT      (glyphs, full res, hard edges)
 *   2. blur x2     -> fieldRT     (quarter res, soft gradient around glyphs)
 *   3. ink sim     -> inkRT       (capped res, reacts to mask + field)
 *   4. composite   -> screen      (upscales inkRT)
 *   5. text display -> screen     (native res, on top, doesn't clear)
 *
 * addPass() order below is also a *resize* dependency, not just a render
 * one: HeroStage resizes passes in registration order, and blurH reads
 * maskTarget's freshly-resized dimensions, blurV reads blurTempTarget's —
 * both would read stale sizes if reordered ahead of what they depend on.
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

  const text = createHeroTextPass(textTargets);

  // --- 1. Text mask: glyphs in white on black, full native resolution ---
  const maskTarget = makeRedTarget();
  addPass({
    ...text.mask,
    target: maskTarget,
    onResize: (_renderer, cssWidth, cssHeight, dpr) => {
      maskTarget.setSize(
        Math.max(1, Math.round(cssWidth * dpr)),
        Math.max(1, Math.round(cssHeight * dpr)),
      );
    },
  });

  // --- 2. Two-pass separable blur: maskRT -> blurTempRT -> fieldRT ------
  const blurTempTarget = makeRedTarget();
  const fieldTarget = makeRedTarget();

  const blurH = createFullscreenPass({
    vertexShader: fullscreenVertexShader,
    fragmentShader: blurFragmentShader,
    uniforms: {
      uSource: { value: maskTarget.texture },
      uTexelSize: { value: new THREE.Vector2(1, 1) },
      uDirection: { value: new THREE.Vector2(1, 0) },
    },
  });
  addPass({
    pass: blurH,
    target: blurTempTarget,
    onResize: (_renderer, cssWidth, cssHeight, dpr) => {
      const w = Math.max(1, Math.round((cssWidth * dpr) / FIELD_DOWNSAMPLE));
      const h = Math.max(1, Math.round((cssHeight * dpr) / FIELD_DOWNSAMPLE));
      blurTempTarget.setSize(w, h);
      // Blurring a full-res source into a quarter-res target: the texel
      // step is sized in the *source*'s resolution (maskTarget), since
      // that's what uSource actually samples from.
      blurH.uniforms.uTexelSize.value.set(1 / maskTarget.width, 1 / maskTarget.height);
    },
  });

  const blurV = createFullscreenPass({
    vertexShader: fullscreenVertexShader,
    fragmentShader: blurFragmentShader,
    uniforms: {
      uSource: { value: blurTempTarget.texture },
      uTexelSize: { value: new THREE.Vector2(1, 1) },
      uDirection: { value: new THREE.Vector2(0, 1) },
    },
  });
  addPass({
    pass: blurV,
    target: fieldTarget,
    onResize: (_renderer, cssWidth, cssHeight, dpr) => {
      const w = Math.max(1, Math.round((cssWidth * dpr) / FIELD_DOWNSAMPLE));
      const h = Math.max(1, Math.round((cssHeight * dpr) / FIELD_DOWNSAMPLE));
      fieldTarget.setSize(w, h);
      blurV.uniforms.uTexelSize.value.set(1 / blurTempTarget.width, 1 / blurTempTarget.height);
    },
  });

  // --- 3. Ink simulation, reacting to the mask + field above -----------
  const ink = createInkPass();
  ink.uniforms.textMask.value = maskTarget.texture;
  ink.uniforms.textField.value = fieldTarget.texture;

  const inkTarget = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
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

  // --- 4. Composite: upscale inkRT onto the screen ----------------------
  const composite = createFullscreenPass({
    vertexShader: fullscreenVertexShader,
    fragmentShader: compositeFragmentShader,
    uniforms: { uSource: { value: inkTarget.texture } },
  });
  addPass({ pass: composite });

  // --- 5. Text, drawn on top at native res, without clearing the screen -
  addPass({ ...text.display, clear: false });

  function destroy() {
    destroyStage();
    maskTarget.dispose();
    blurTempTarget.dispose();
    fieldTarget.dispose();
    inkTarget.dispose();
  }

  return { ink: { opacity: ink.uniforms.opacity }, textReady: text.ready, destroy };
}
