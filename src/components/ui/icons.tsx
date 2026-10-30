import type { SVGProps } from "react";

// Hand-drawn 24px line icons for the preference controls. Decorative:
// the buttons that hold them carry the accessible names.

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Light theme: a tall glass with a straw and ice. */
export function IcedCoffeeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 8.5h12" />
      <path d="M6.5 8.5c.3-2.2 2.6-3.5 5.5-3.5s5.2 1.3 5.5 3.5" />
      <path d="M7 8.5 8.2 20a1 1 0 0 0 1 .9h5.6a1 1 0 0 0 1-.9L17 8.5" />
      <path d="M12.5 5.2 14.5 2h2.5" />
      <rect x="9.4" y="12" width="2.6" height="2.6" rx="0.5" />
      <rect x="12.3" y="15" width="2.6" height="2.6" rx="0.5" />
    </Icon>
  );
}

/** Dark theme: a steaming mug. */
export function HotCoffeeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10.5h12v4.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 11.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3.5c-.9.8-.9 1.7 0 2.5s.9 1.7 0 2.5" />
      <path d="M12 3.5c-.9.8-.9 1.7 0 2.5s.9 1.7 0 2.5" />
    </Icon>
  );
}

export function SoundIcon({ muted, ...props }: IconProps & { muted: boolean }) {
  return (
    <Icon {...props}>
      <path d="M4 9.5h3l4.5-4v13l-4.5-4H4z" />
      {muted ? (
        <path d="m15.5 9.5 5 5m0-5-5 5" />
      ) : (
        <>
          <path d="M15 9.2a4 4 0 0 1 0 5.6" />
          <path d="M17.8 6.5a8 8 0 0 1 0 11" />
        </>
      )}
    </Icon>
  );
}
