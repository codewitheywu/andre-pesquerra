// Shared timing for `motion` and `lenis`, per CLAUDE.md §2.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const REVEAL = {
  duration: 0.5,
  distance: 10,
  stagger: 0.05,
} as const;

export const SCROLL = {
  lerp: 0.1,
} as const;
