precision highp float;

uniform vec2 uResolution;    // CSS px, for a stable aspect ratio regardless of DPR cap
uniform float uTime;         // real elapsed seconds since mount — never accumulated/clamped
uniform float uVelocity;     // 0..1 smoothed scroll speed
uniform float uOpacity;      // entrance: 0 -> 1 over 1.4s, tweened outside the shader
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uAccent;

// Glyph coverage (hard edge, from the text mirror mask pass) and its
// blurred field (soft falloff around glyphs, from the two-pass blur) — see
// InkBackground.tsx. Both single-channel: only .r carries data.
uniform sampler2D uTextMask;
uniform sampler2D uTextField;

varying vec2 vUv;

// ---------------------------------------------------------------------
// Value noise + fbm. A cheap hash-based value noise reads the same as a
// gradient noise (Perlin/Simplex) at the frequencies used below, for a
// fraction of the ALU cost per pixel.
// ---------------------------------------------------------------------
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Five octaves, frequency doubling with a slight offset (2.02 rather than
// 2.0) so the octave grids never align, half amplitude gain per octave.
// The result has no dominant scale — a nebulous field, not a repeating tile.
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * valueNoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

// Curl of fbm's scalar field: rotate its gradient 90 degrees. A rotated
// gradient field is divergence-free by construction (Bridson et al., "Curl
// Noise for Procedural Fluid Flow") — it swirls without ever having a
// source or sink, so ink can only move, never appear or vanish at a point.
vec2 curl(vec2 p) {
  float e = 0.08;
  float n1 = fbm(p + vec2(0.0, e));
  float n2 = fbm(p - vec2(0.0, e));
  float n3 = fbm(p + vec2(e, 0.0));
  float n4 = fbm(p - vec2(e, 0.0));
  float dx = (n1 - n2) / (2.0 * e);
  float dy = (n3 - n4) / (2.0 * e);
  return vec2(dy, -dx);
}

// Direction in which glyph coverage increases, read from the blurred
// field — points from paper toward a letterform. Used to steer the flow
// away from text and, near the middle of its range, to find the glyph's
// edge band.
vec2 fieldGradient(vec2 uv) {
  vec2 e = 1.5 / uResolution;
  float l = texture2D(uTextField, uv - vec2(e.x, 0.0)).r;
  float r = texture2D(uTextField, uv + vec2(e.x, 0.0)).r;
  float d = texture2D(uTextField, uv - vec2(0.0, e.y)).r;
  float u = texture2D(uTextField, uv + vec2(0.0, e.y)).r;
  return vec2(r - l, u - d);
}

// Named/grouped so the tuning is easy to find as a block instead of buried
// inline in main().
const float REPULSION_AT_REST = 0.9;
const float REPULSION_AT_SPEED = 2.4;
const float EDGE_ACCUMULATION = 0.3;
const float LEGIBILITY_WASH = 0.85;
const float DRIFT_SPEED = 0.015; // noise-space units per second — deliberately near-imperceptible

void main() {
  vec2 uv = vUv;
  uv.x *= uResolution.x / max(uResolution.y, 1.0);

  // Turbulence roughly triples between standstill and fast scroll.
  float turbulence = 1.0 + uVelocity * 2.0;
  vec2 flow = curl(uv * 2.4 * turbulence + uTime * 0.03);

  // Steer the flow away from glyphs before advecting (fieldGradient points
  // toward letterforms, so subtracting it pushes the other way), harder
  // while scrolling so the parting is visibly active, not just a static bias.
  float repulsion = mix(REPULSION_AT_REST, REPULSION_AT_SPEED, uVelocity);
  flow -= fieldGradient(vUv) * repulsion;

  // Advecting the sample point along the flow — not just offsetting phase
  // by time — is what reads as "flowing" rather than "shimmering".
  vec2 advected = uv + flow * 0.35;
  float density = fbm(advected * 2.0 - uTime * DRIFT_SPEED);
  density = clamp(density, 0.0, 1.0);

  // Where the blurred field sits in its mid-range, we're at a glyph's
  // edge — past its solid core, short of open paper — and pigment pools
  // there like ink meeting a resist.
  float field = texture2D(uTextField, vUv).r;
  float edgeBand = smoothstep(0.08, 0.3, field) - smoothstep(0.3, 0.55, field);
  density = clamp(density + edgeBand * EDGE_ACCUMULATION, 0.0, 1.0);

  // Density -> color. Wide, soft transition: ink has concentration, not a contour.
  vec3 color = mix(uPaper, uInk, smoothstep(0.35, 0.75, density));

  // The wet edge: a thin vein of accent exactly where the density gradient
  // is steepest, standing in for the lightest pigment migrating fastest to
  // the rim of a real ink stroke. The only place the accent ever appears.
  float wetEdge = smoothstep(0.42, 0.5, density) - smoothstep(0.5, 0.58, density);
  color = mix(color, uAccent, wetEdge * 0.45);

  // Legibility: wash back toward paper at glyph precision (hard mask) with
  // a soft margin from the blurred field, instead of a fixed band guessing
  // where text sits.
  float mask = texture2D(uTextMask, vUv).r;
  float legibility = max(mask, smoothstep(0.55, 0.85, field));
  color = mix(color, uPaper, legibility * LEGIBILITY_WASH);

  gl_FragColor = vec4(color, uOpacity);
}
