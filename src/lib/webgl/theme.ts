import { Color } from "three";

// Exactly three colors, kept in sync with the --color-* tokens in
// src/styles/app.css. Paper is density-zero, ink is density-max, accent
// appears only at the wet edge (see ink.frag) — never blended elsewhere.
export const PAPER_HEX = "#edeae2";
export const INK_HEX = "#1c1b17";
export const ACCENT_HEX = "#8b3a2b";

export const PAPER = new Color(PAPER_HEX);
export const INK = new Color(INK_HEX);
export const ACCENT = new Color(ACCENT_HEX);
