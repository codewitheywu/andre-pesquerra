"use client";

import { useEffect, useState } from "react";
import { navigationItems } from "@/data/content";

/** Sidebar section links that mark the section currently being read. */
export default function SectionNav() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = navigationItems
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section) => section !== null);

    // A section is "current" while it crosses a band just above the middle
    // of the viewport, so short sections still get their turn.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Sections">
      <ol className="space-y-1">
        {navigationItems.map((item, index) => {
          const active = activeId === item.href.slice(1);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={active ? "location" : undefined}
                className={`group flex items-center gap-3 rounded-sm py-1 text-body transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="font-mono text-meta" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.label}</span>
                <span
                  aria-hidden="true"
                  className={`h-px flex-1 transition-colors ${active ? "bg-accent" : "bg-transparent"}`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
