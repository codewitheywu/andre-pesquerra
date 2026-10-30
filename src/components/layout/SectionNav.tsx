"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigationItems } from "@/data/content";
import { pickCurrentSection } from "@/lib/scrollspy";
import SectionLink from "./SectionLink";

const PAGES = [
  { href: "/blog", label: "Blog" },
  { href: "/behind-the-code", label: "Behind the Code" },
  { href: "/consulting", label: "Consulting" },
];

/**
 * The caramel line after a page link: solid on the current page, breathing
 * while the link waits on a page that is not prefetched yet.
 */
function PageLine({ current }: { current: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      data-pending={pending}
      className={`leader flex-1 transition-opacity [--leader-line:var(--accent)] ${
        current || pending ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

/**
 * Sidebar section links that mark the section currently being read, then,
 * under a thin divider, the pages that live outside the homepage.
 */
export default function SectionNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();
  const onHome = pathname === "/";
  // While a clicked link's smooth scroll runs, keep its line instead of
  // flicking through every section passed on the way.
  const clickedId = useRef<string | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Re-run per page: coming back home brings new section elements.
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = navigationItems
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section) => section !== null);

    let frame = 0;
    const update = () => {
      frame = 0;
      if (clickedId.current) return;
      const root = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2;
      const tops = sections.map((section) => ({ id: section.id, top: section.getBoundingClientRect().top }));
      setActiveId(pickCurrentSection(tops, window.innerHeight * 0.4, atBottom));
    };
    const onScroll = () => {
      if (clickedId.current) {
        // The scroll has settled once no scroll event arrives for a moment.
        clearTimeout(settle.current);
        settle.current = setTimeout(() => {
          clickedId.current = null;
          update();
        }, 200);
      }
      if (!frame) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(settle.current);
      clickedId.current = null;
    };
  }, [pathname]);

  function markClicked(id: string) {
    clickedId.current = id;
    setActiveId(id);
    // If the page is already there, no scroll follows to release the hold.
    clearTimeout(settle.current);
    settle.current = setTimeout(() => (clickedId.current = null), 1500);
  }

  return (
    <nav aria-label="Sections">
      <ul className="space-y-1 short:space-y-0">
        {navigationItems.map((item) => {
          const active = onHome && activeId === item.href.slice(1);
          return (
            <li key={item.href}>
              <SectionLink
                id={item.href.slice(1)}
                onClick={() => markClicked(item.href.slice(1))}
                aria-current={active ? "location" : undefined}
                className={`flex items-center gap-3 rounded-sm py-1 text-body transition-colors ${
                  active ? "font-medium text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span>{item.label}</span>
                {/* The current section gets a caramel line after its name. */}
                <span
                  aria-hidden="true"
                  className={`leader flex-1 transition-opacity [--leader-line:var(--accent)] ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </SectionLink>
            </li>
          );
        })}
      </ul>
      <div aria-hidden="true" className="leader my-3 short:my-2" />
      <ul className="space-y-1 short:space-y-0">
        {PAGES.map((page) => {
          const current = pathname === page.href;
          return (
            <li key={page.href}>
              <Link
                href={page.href}
                aria-current={current ? "page" : undefined}
                className={`flex items-center gap-3 rounded-sm py-1 text-body transition-colors ${
                  current ? "font-medium text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span>{page.label}</span>
                <PageLine current={current} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
