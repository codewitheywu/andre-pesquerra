/**
 * The coffee-ring halftone (public/halftone.svg, made by scripts/halftone.mjs).
 * Drawn with <use>, so the dots take the theme's colour through currentColor
 * and, unlike a CSS mask image, never count as the page's largest paint.
 */
export default function Halftone({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={`halftone pointer-events-none ${className}`}>
      <use href="/halftone.svg#halftone" />
    </svg>
  );
}
