precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uVelocity; // 0..1 smoothed scroll speed, see scroll-state.ts
uniform float uOpacity;  // entrance fade, tweened by Hero.tsx
uniform vec3 uPaper;     // --color-paper, see ../../theme.ts
uniform vec3 uInk;       // --color-ink
uniform vec3 uAccent;    // --color-accent

// Glyph coverage (full res, hard edges) and its blurred field (quarter res,
// soft — see HeroPipeline.ts) of the hero's WebGL text pass. Both RedFormat:
// only the .r channel carries data.
uniform sampler2D uTextMask;
uniform sampler2D uTextField;

varying vec2 vUv;

// ---------------------------------------------------------------------
// Cheap hash-based value noise + fbm. Not a "real" gradient noise like
// Perlin/Simplex, but at the frequencies used here it reads the same and
// costs less per pixel.
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

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * valueNoise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

// Curl of a scalar potential: rotate its gradient 90 degrees. This gives a
// flow field that looks divergence-free (ink doesn't appear/vanish at a
// point) without ever solving pressure — the standard cheap substitute for
// a real fluid solver in procedural work (see Bridson et al.,
// "Curl-Noise for Procedural Fluid Flow").
vec2 curl(vec2 p) {
  float eps = 0.08;
  float n1 = fbm(p + vec2(0.0, eps));
  float n2 = fbm(p - vec2(0.0, eps));
  float n3 = fbm(p + vec2(eps, 0.0));
  float n4 = fbm(p - vec2(eps, 0.0));
  float dx = (n1 - n2) / (2.0 * eps);
  float dy = (n3 - n4) / (2.0 * eps);
  return vec2(dy, -dx);
}

// Direction in which the blurred field's coverage increases — i.e. the
// direction from paper toward a glyph. Used both to steer ink away from
// letterforms and (reversed) to find their edge band for accumulation.
vec2 fieldGradient(vec2 uv) {
  vec2 e = 2.0 / uResolution;
  float l = texture2D(uTextField, uv - vec2(e.x, 0.0)).r;
  float r = texture2D(uTextField, uv + vec2(e.x, 0.0)).r;
  float d = texture2D(uTextField, uv - vec2(0.0, e.y)).r;
  float u = texture2D(uTextField, uv + vec2(0.0, e.y)).r;
  return vec2(r - l, u - d);
}

// Tuning constants for the text/ink reaction — kept named and grouped so
// they're easy to find and adjust as a block rather than buried in main().
const float REPULSION_MIN = 0.9; // flow-field push away from glyphs, at rest
const float REPULSION_MAX = 2.4; // ...at full scroll velocity
const float EDGE_ACCUMULATION = 0.3; // extra density where ink butts against a glyph
const float LEGIBILITY_WASH = 0.85; // how far the color is pulled back toward paper at glyphs

void main() {
  vec2 aspectUv = vUv;
  aspectUv.x *= uResolution.x / uResolution.y;

  float field = texture2D(uTextField, vUv).r;

  // Turbulence grows with scroll velocity: calm when still, roiled mid-scroll.
  float turbulence = 1.0 + uVelocity * 2.2;
  vec2 flow = curl(aspectUv * 2.4 * turbulence + uTime * 0.03);

  // Push the flow away from glyphs before advecting — fieldGradient points
  // from paper toward letterforms, so subtracting it steers the flow the
  // other way. Stronger while scrolling, so the ink visibly parts around
  // the name rather than drifting through it at rest too.
  float repulsion = mix(REPULSION_MIN, REPULSION_MAX, uVelocity);
  flow -= fieldGradient(vUv) * repulsion;

  // Advecting the sample point along the flow field over time is what
  // reads as "moving ink" rather than a static marbled texture.
  vec2 advected = aspectUv + flow * 0.35;

  float density = fbm(advected * 2.0 - uTime * 0.015);
  density = clamp(density, 0.0, 1.0);

  // Where the blurred field sits in its mid-range, we're right at a
  // glyph's edge (past the plateau at its core, short of open paper) — the
  // pigment butts against the letterform and pools there, like ink meeting
  // a resist on absorbent paper.
  float edgeBand = smoothstep(0.08, 0.3, field) - smoothstep(0.3, 0.55, field);
  density = clamp(density + edgeBand * EDGE_ACCUMULATION, 0.0, 1.0);

  vec3 color = mix(uPaper, uInk, smoothstep(0.35, 0.75, density));

  // A thin vein of pigment where the density gradient is steepest — the
  // "wet edge" of a real ink stroke, not a flat two-tone blend.
  float edge = smoothstep(0.42, 0.5, density) - smoothstep(0.5, 0.58, density);
  color = mix(color, uAccent, edge * 0.45);

  // Legibility: wash the result back toward paper at glyph-precision
  // (mask ~= 1 inside a letterform, its blurred field extends the wash a
  // little further as a soft margin) instead of the old fixed-height band
  // across the bottom of the viewport that guessed at where the text sat.
  float mask = texture2D(uTextMask, vUv).r;
  float legibility = max(mask, smoothstep(0.55, 0.85, field));
  color = mix(color, uPaper, legibility * LEGIBILITY_WASH);

  gl_FragColor = vec4(color, uOpacity);
}
