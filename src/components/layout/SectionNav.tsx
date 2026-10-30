"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigationItems } from "@/data/content";
import SectionLink from "./SectionLink";

/**
 * Sidebar section links that mark the section currently being read, then,
 * under a dotted divider, the pages that live outside the homepage.
 */
export default function SectionNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const onBlog = usePathname() === "/blog";

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
      <ul className="space-y-1 short:space-y-0">
        {navigationItems.map((item) => {
          const active = activeId === item.href.slice(1);
          return (
            <li key={item.href}>
              <SectionLink
                id={item.href.slice(1)}
                aria-current={active ? "location" : undefined}
                className={`flex items-center gap-3 rounded-sm py-1 text-body transition-colors ${
                  active ? "font-medium text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span>{item.label}</span>
                {/* The current section is underlined with a caramel dot leader. */}
                <span
                  aria-hidden="true"
                  className={`leader flex-1 transition-opacity [--leader-dot:var(--accent)] ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </SectionLink>
            </li>
          );
        })}
      </ul>
      <div aria-hidden="true" className="leader my-3 short:my-2" />
      <ul>
        <li>
          <Link
            href="/blog"
            aria-current={onBlog ? "page" : undefined}
            className={`flex items-center rounded-sm py-1 text-body transition-colors ${
              onBlog ? "font-medium text-ink" : "text-muted hover:text-ink"
            }`}
          >
            Blog
          </Link>
        </li>
      </ul>
    </nav>
  );
}
