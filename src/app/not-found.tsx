import type { Metadata } from "next";
import Link from "next/link";
import Halftone from "@/components/ui/Halftone";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// Where a lost visitor most likely meant to go, listed like a menu.
const DESTINATIONS = [
  { href: "/", label: "Home", note: "projects and experience" },
  { href: "/consulting", label: "Consulting", note: "services and inquiries" },
  { href: "/blog", label: "Blog", note: "TikTok posts" },
  { href: "/behind-the-code", label: "Behind the Code", note: "story and hobbies" },
];

export default function NotFound() {
  return (
    <>
      <Halftone className="absolute top-0 right-0 -z-10 size-105 max-w-full sm:size-160" />
      <main id="main" className="mx-auto flex min-h-svh max-w-170 flex-col justify-center px-5 py-16 sm:px-8">
        <p className="font-mono text-meta text-muted">404 · not on the menu</p>
        <h1 className="mt-3 text-h2 font-semibold text-ink sm:text-h1">This page doesn&apos;t exist.</h1>
        <p className="mt-4 max-w-136 text-lead text-ink-2">
          The link may be outdated, or the address may have a typo. Here&apos;s what&apos;s being served:
        </p>

        <nav aria-label="Pages" className="mt-10">
          <ul className="space-y-1">
            {DESTINATIONS.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="group flex min-h-11 items-center gap-3 rounded-sm text-body text-ink-2 transition-colors hover:text-ink"
                >
                  <span className="font-medium text-ink">{page.label}</span>
                  <span aria-hidden="true" className="leader flex-1 transition-colors group-hover:[--leader-line:var(--accent)]" />
                  <span className="hidden font-mono text-meta text-muted sm:inline">{page.note}</span>
                  <span aria-hidden="true" className="nudge text-muted">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </>
  );
}
