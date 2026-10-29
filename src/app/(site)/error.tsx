"use client";

import { siteContent } from "@/data/content";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-[70svh] flex-col justify-center gap-6">
      <p className="font-mono text-meta text-muted">error — something broke</p>
      <h1 className="text-h2 font-semibold text-ink">This page failed to load.</h1>
      <p className="text-body text-ink-2">
        Try again. If it keeps happening, email{" "}
        <a href={`mailto:${siteContent.email}`} className="link-draw text-ink">
          {siteContent.email}
        </a>
        {error.digest && <> and mention reference {error.digest}</>}.
      </p>
      <button
        type="button"
        onClick={reset}
        className="press inline-flex min-h-11 w-fit items-center rounded-md bg-ink px-4 text-meta text-bg"
      >
        Try again
      </button>
    </div>
  );
}
