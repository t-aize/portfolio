// Passthrough vertex shader for a fullscreen triangle/quad. The mesh sits
// directly in clip space, so `position` is used verbatim and the vertex
// shader never looks at the camera — only the fragment shader does work.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
