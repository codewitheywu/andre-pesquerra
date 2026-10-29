import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-svh max-w-170 flex-col justify-center gap-6 px-5 sm:px-8"
    >
      <p className="font-mono text-meta text-muted">404 — not found</p>
      <h1 className="text-h2 font-semibold text-ink">This page doesn&apos;t exist.</h1>
      <p className="text-body text-ink-2">
        The link may be outdated, or the address may have a typo.
      </p>
      <Link
        href="/"
        className="press inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-ink px-4 text-meta text-bg"
      >
        Back to the homepage <span aria-hidden="true" className="nudge">→</span>
      </Link>
    </main>
  );
}
