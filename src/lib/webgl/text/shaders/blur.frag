precision highp float;

// Separable 9-tap gaussian, reused for both the horizontal and vertical
// pass (see HeroPipeline.ts) — only uDirection differs between them. Reads
// a single red channel (glyph coverage) and writes it back the same way;
// there's no color here, maskRT/fieldRT are both RedFormat.
uniform sampler2D uSource;
uniform vec2 uTexelSize; // 1 / uSource resolution, in the sampled direction
uniform vec2 uDirection; // (1,0) for the horizontal pass, (0,1) for vertical

varying vec2 vUv;

void main() {
  vec2 step = uDirection * uTexelSize;

  float sum = texture2D(uSource, vUv).r * 0.227027;
  sum += texture2D(uSource, vUv + step).r * 0.1945946;
  sum += texture2D(uSource, vUv - step).r * 0.1945946;
  sum += texture2D(uSource, vUv + step * 2.0).r * 0.1216216;
  sum += texture2D(uSource, vUv - step * 2.0).r * 0.1216216;
  sum += texture2D(uSource, vUv + step * 3.0).r * 0.054054;
  sum += texture2D(uSource, vUv - step * 3.0).r * 0.054054;
  sum += texture2D(uSource, vUv + step * 4.0).r * 0.016216;
  sum += texture2D(uSource, vUv - step * 4.0).r * 0.016216;

  gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
}
