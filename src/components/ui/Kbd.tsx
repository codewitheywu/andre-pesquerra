import type { ReactNode } from "react";

export default function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded-sm border border-border bg-surface px-1.5 font-mono text-meta leading-5 text-ink-2">
      {children}
    </kbd>
  );
}
