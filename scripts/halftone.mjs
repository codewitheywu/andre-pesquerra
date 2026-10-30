// Generates public/halftone.svg: a halftone coffee-ring stain fading out
// from the top-right corner. The page uses it as a CSS mask, so the dots
// take their colour from the theme. Run: node scripts/halftone.mjs

import { writeFileSync } from "node:fs";

const SIZE = 640;
const STEP = 12;
const MAX_RADIUS = STEP * 0.45;

// Where a mug was set down, and a second, fainter one that overlaps it.
const RINGS = [
  { cx: 548, cy: 132, radius: 84, weight: 1, phase: 2.2 },
  { cx: 596, cy: 300, radius: 50, weight: 0.7, phase: -0.9 },
];

const clamp = (value) => Math.min(1, Math.max(0, value));

// A dried ring is sharp on the outside and bleeds softly inward, and it is
// heavier on one side than the other.
function ringStrength({ cx, cy, radius, weight, phase }, x, y) {
  const distance = Math.hypot(x - cx, y - cy);
  const offset = distance - radius;
  const edge = offset > 0 ? Math.exp(-((offset / 5) ** 2)) : Math.exp(-((offset / 26) ** 2)) * 0.8;
  const side = 0.6 + 0.4 * Math.cos(Math.atan2(y - cy, x - cx) - phase);
  return edge * side * weight;
}

const dots = [];
for (let y = STEP / 2; y < SIZE; y += STEP) {
  for (let x = STEP / 2; x < SIZE; x += STEP) {
    const corner = clamp(1 - Math.hypot(SIZE - x, y) / 520) ** 1.6 * 0.6;
    const strength = Math.max(corner, ...RINGS.map((ring) => ringStrength(ring, x, y)));
    const r = Math.round(strength * MAX_RADIUS * 10) / 10;
    if (r >= 0.5) dots.push(`<circle cx="${x}" cy="${y}" r="${r}"/>`);
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">${dots.join("")}</svg>\n`;
writeFileSync(new URL("../public/halftone.svg", import.meta.url), svg);
process.stdout.write(`public/halftone.svg: ${dots.length} dots, ${(svg.length / 1024).toFixed(1)} kB\n`);
