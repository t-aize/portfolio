// The plane geometry is already a 2x2 quad at z=0, so its local position IS
// clip space — no camera/projection math needed for a full-screen effect.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
