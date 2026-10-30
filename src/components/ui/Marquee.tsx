"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import TextLink from "./TextLink";

type MarqueeProps = {
  label: string;
  action: { label: string; href: string };
  /** A list of <li> items, rendered twice so the loop has no visible gap. */
  children: ReactNode;
};

/**
 * Endless horizontal row. It only moves while on screen (no work for rows
 * nobody sees), holds still on hover and keyboard focus, and becomes a
 * static wrapped list under reduced motion (globals.css).
 */
export default function Marquee({ label, action, children }: MarqueeProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry?.isIntersecting ?? false));
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-body font-medium tracking-normal text-ink-2">{label}</h3>
        <TextLink
          href={action.href}
          className="inline-flex min-h-11 items-center font-mono text-meta lowercase lg:min-h-6"
        >
          {action.label}
        </TextLink>
      </div>
      <div ref={rowRef} className="marquee" data-running={onScreen}>
        <ul className="marquee-track">{children}</ul>
        <ul className="marquee-track" aria-hidden="true">
          {children}
        </ul>
      </div>
    </div>
  );
}
