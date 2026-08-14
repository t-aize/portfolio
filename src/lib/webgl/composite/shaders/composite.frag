precision highp float;

// Straight passthrough: upscales whatever inkRT rendered at (capped, see
// HeroPipeline.ts) into the screen's native-DPR framebuffer. LinearFilter
// on the source texture (set where inkRT is created) does the actual
// upscale; this shader just samples it.
uniform sampler2D uSource;

varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(uSource, vUv);
}
