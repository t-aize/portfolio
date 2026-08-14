precision highp float;

// One direction of a separable blur — run once horizontally and once
// vertically (see InkBackground.tsx) to approximate a 2D Gaussian at 2N
// instead of N^2 texture reads. Weights are the standard 5-tap discrete
// Gaussian kernel (sigma ~ 3, normalized to sum to 1 across all 9 taps).
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform vec2 uDirection;

varying vec2 vUv;

const float WEIGHTS[5] = float[5](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

void main() {
  vec2 step = uTexelSize * uDirection;
  float sum = texture2D(uSource, vUv).r * WEIGHTS[0];
  for (int i = 1; i < 5; i++) {
    float w = WEIGHTS[i];
    float offset = float(i);
    sum += texture2D(uSource, vUv + step * offset).r * w;
    sum += texture2D(uSource, vUv - step * offset).r * w;
  }
  gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
}
