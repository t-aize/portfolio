precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uVelocity; // 0..1 smoothed scroll speed, see scroll-state.ts
uniform float uOpacity;  // entrance fade, tweened by hero.ts

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

// Keep these in sync by hand with the --color-* tokens in global.css —
// GLSL can't read CSS custom properties.
vec3 paper = vec3(0.929, 0.918, 0.886);  // --color-paper  #edeae2
vec3 ink = vec3(0.110, 0.106, 0.090);    // --color-ink    #1c1b17
vec3 accent = vec3(0.545, 0.227, 0.169); // --color-accent #8b3a2b

void main() {
  vec2 aspectUv = vUv;
  aspectUv.x *= uResolution.x / uResolution.y;

  // Turbulence grows with scroll velocity: calm when still, roiled mid-scroll.
  float turbulence = 1.0 + uVelocity * 2.2;
  vec2 flow = curl(aspectUv * 2.4 * turbulence + uTime * 0.03);

  // Advecting the sample point along the flow field over time is what
  // reads as "moving ink" rather than a static marbled texture.
  vec2 advected = aspectUv + flow * 0.35;

  float density = fbm(advected * 2.0 - uTime * 0.015);
  density = clamp(density, 0.0, 1.0);

  vec3 color = mix(paper, ink, smoothstep(0.35, 0.75, density));

  // A thin vein of pigment where the density gradient is steepest — the
  // "wet edge" of a real ink stroke, not a flat two-tone blend.
  float edge = smoothstep(0.42, 0.5, density) - smoothstep(0.5, 0.58, density);
  color = mix(color, accent, edge * 0.45);

  gl_FragColor = vec4(color, uOpacity);
}
