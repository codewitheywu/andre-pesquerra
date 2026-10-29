"use client";

import { useEffect, useRef, useState } from "react";

type CopyButtonProps = {
  value: string;
  label: string;
};

type Status = "idle" | "copied" | "failed";

/** Copies `value`; swaps to "copied ✓" for 1.5s (CLAUDE.md §2). */
export default function CopyButton({ value, label }: CopyButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    timer.current = setTimeout(() => setStatus("idle"), 1500);
  }

  const text = status === "copied" ? "copied ✓" : status === "failed" ? "copy failed" : "copy";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label}: ${value}`}
      className="press inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-3 font-mono text-meta text-ink-2 transition-colors hover:border-accent hover:text-ink"
    >
      <span aria-live="polite">{text}</span>
    </button>
  );
}
