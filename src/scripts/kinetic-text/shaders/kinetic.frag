precision highp float;

uniform sampler2D uTexture;
uniform float uVelocity; // 0..1 smoothed scroll speed
uniform float uReveal;   // 0..1 entrance wipe progress
uniform vec2 uTexel;     // 1 / (canvas CSS width, height) — see KineticText.ts

varying vec2 vUv;

float glyphAlpha(vec2 uv) {
  return texture2D(uTexture, uv).a;
}

void main() {
  // The canvas texture stores glyph coverage in its alpha channel — sample
  // it three times with a tiny horizontal offset that grows with velocity,
  // a cheap analogue of motion blur without an actual blur pass.
  float split = uVelocity * 0.01;
  float r = glyphAlpha(vUv + vec2(split, 0.0));
  float g = glyphAlpha(vUv);
  float b = glyphAlpha(vUv - vec2(split, 0.0));
  float core = max(r, max(g, b));

  // Dilate the glyph coverage outward a few pixels in 8 directions to build
  // a paper-toned ring behind the letters. Without this, the name (drawn in
  // the same ink/accent palette as the background) can vanish into a dark
  // patch of the ink field — the ring guarantees a light-to-dark edge right
  // at each glyph regardless of what's moving behind it.
  const int STEPS = 8;
  const float RADIUS_PX = 3.0;
  float halo = core;
  for (int i = 0; i < STEPS; i++) {
    float angle = 6.28318 * float(i) / float(STEPS);
    vec2 offset = vec2(cos(angle), sin(angle)) * uTexel * RADIUS_PX;
    halo = max(halo, glyphAlpha(vUv + offset));
  }

  vec3 ink = vec3(0.110, 0.106, 0.090);    // --color-ink    #1c1b17
  vec3 accent = vec3(0.545, 0.227, 0.169); // --color-accent #8b3a2b
  vec3 paper = vec3(0.929, 0.918, 0.886);  // --color-paper  #edeae2

  // Bias the leading (red) channel toward the accent so the aberration
  // reads as pigment separating under speed, not a generic RGB glitch.
  vec3 glyphColor = mix(ink, accent, r * 0.5);
  float ratio = halo > 0.001 ? clamp(core / halo, 0.0, 1.0) : 0.0;
  vec3 color = mix(paper, glyphColor, ratio);

  // Left-to-right wipe for the entrance. Feathered only on the trailing
  // (already-revealed) side — critically, a pixel at uv.x must never show
  // *ahead* of uReveal, or the very first glyph leaks through before the
  // wipe has even started (this was the actual bug: the previous formula
  // compared the wrong operands and left a permanent sliver of the first
  // letter visible at uReveal = 0).
  float wipe = 1.0 - smoothstep(uReveal - 0.08, uReveal, vUv.x);

  gl_FragColor = vec4(color, halo * wipe);
}
