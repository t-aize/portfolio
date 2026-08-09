import { Vector3 } from "three";

/**
 * Single source of truth for the ink shader's palette, mirroring the
 * --color-* custom properties in global.css. GLSL can't read CSS custom
 * properties, so ink.frag receives these as uniforms instead of
 * hardcoding its own copy (it used to, and drifting out of sync was a
 * real risk). Vector3 rather than THREE.Color: Color would run these
 * through Three's sRGB/linear color management, silently changing the
 * component values the shader was tuned against.
 */
export const PAPER = new Vector3(0.929, 0.918, 0.886); // --color-paper  #edeae2
export const INK = new Vector3(0.11, 0.106, 0.09); // --color-ink    #1c1b17
export const ACCENT = new Vector3(0.545, 0.227, 0.169); // --color-accent #8b3a2b
