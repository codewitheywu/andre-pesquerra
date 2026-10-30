"use client";

import { useEffect, useRef } from "react";
import { INQUIRIES_PER_HOUR } from "@/data/consulting";
import { siteContent } from "@/data/content";

const emailLink = (
  <a href={`mailto:${siteContent.email}`} className="link-draw font-mono text-ink">
    {siteContent.email}
  </a>
);

/** Replaces the form once an inquiry is in; takes focus so the change is announced. */
export function InquirySent({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-lg border border-border bg-surface p-6 sm:p-8">
      <p className="font-mono text-meta text-muted">inquiry sent</p>
      <h3 className="mt-2 text-h3 font-semibold text-ink">Thanks{name ? `, ${name}` : ""}.</h3>
      <p className="mt-3 max-w-136 text-body text-ink-2">
        Your inquiry is in. I read every one and will reply by email with next steps.
      </p>
    </div>
  );
}

/** The 429: too many inquiries from one visitor within the hour. */
export function InquiryRateLimited({ minutes }: { minutes: number }) {
  return (
    <div role="alert" className="border-b border-border bg-surface-2 p-5 sm:p-6">
      <p className="font-mono text-meta text-muted">429 · too many requests</p>
      <h3 className="mt-1 text-lead font-semibold tracking-normal text-ink">
        That&apos;s a lot of inquiries in one hour.
      </h3>
      <p className="mt-2 text-body text-ink-2">
        To keep spam out, each visitor can send {INQUIRIES_PER_HOUR} an hour. Try again in about{" "}
        {minutes} {minutes === 1 ? "minute" : "minutes"}, or email me at {emailLink}. What you wrote is
        still in the form below.
      </p>
    </div>
  );
}

/** Something failed on the server: nothing was sent, and the form keeps its text. */
export function InquiryFailed() {
  return (
    <p role="alert" className="text-body text-ink sm:col-span-2">
      <span aria-hidden="true" className="mr-1.5 text-accent">
        ↳
      </span>
      Your inquiry didn&apos;t go through on my side. Please try again, or email me at {emailLink}.
    </p>
  );
}
