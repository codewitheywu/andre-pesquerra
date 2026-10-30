import type { SimpleIcon } from "simple-icons";

/** A brand mark from simple-icons, drawn in the current text colour. */
export default function ToolLogo({ icon, size = 20 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <path d={icon.path} />
    </svg>
  );
}
