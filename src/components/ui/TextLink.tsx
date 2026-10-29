import type { ReactNode } from "react";

type TextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

function isExternal(href: string) {
  return /^https?:\/\//.test(href) || href.endsWith(".pdf");
}

/**
 * Text link with the drawn underline. External links get `↗` and open in a
 * new tab; in-page links get `→` (CLAUDE.md §1).
 */
export default function TextLink({ href, children, className = "" }: TextLinkProps) {
  const external = isExternal(href);

  return (
    <a
      href={href}
      className={`link-draw text-ink-2 transition-colors hover:text-ink ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <span aria-hidden="true" className={`nudge ml-1 ${external ? "nudge-up" : ""}`}>
        {external ? "↗" : "→"}
      </span>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
