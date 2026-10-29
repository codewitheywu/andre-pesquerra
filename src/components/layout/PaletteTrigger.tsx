"use client";

import type { ReactNode } from "react";
import Kbd from "@/components/ui/Kbd";
import { useHydrated } from "@/hooks/useHydrated";
import { openCommandPalette } from "./CommandPalette";

type PaletteTriggerProps = {
  children: ReactNode;
  className?: string;
  showShortcut?: boolean;
};

export default function PaletteTrigger({
  children,
  className = "",
  showShortcut = true,
}: PaletteTriggerProps) {
  // "Ctrl" during SSR, "⌘" once the client knows it is on an Apple platform.
  const hydrated = useHydrated();
  const modifier = hydrated && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-haspopup="dialog"
      aria-keyshortcuts="Control+K Meta+K"
      className={`press inline-flex items-center gap-2 ${className}`}
    >
      {children}
      {showShortcut && (
        <span className="inline-flex gap-1" aria-hidden="true">
          <Kbd>{modifier}</Kbd>
          <Kbd>K</Kbd>
        </span>
      )}
    </button>
  );
}
