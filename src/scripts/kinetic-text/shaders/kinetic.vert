uniform float uTime;
uniform float uVelocity; // 0..1 smoothed scroll speed

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Horizontal shear grows with scroll speed — the faster the page moves,
  // the more the glyphs lean into the motion, like ink dragged by a brush.
  // The sine keeps it as a shear rather than a rigid slide: top and bottom
  // of the glyphs displace in opposite phase.
  float shear = sin(uv.y * 3.14159 + uTime * 0.6) * uVelocity * 0.06;
  pos.x += shear;

  gl_Position = vec4(pos.xy, 0.0, 1.0);
}
