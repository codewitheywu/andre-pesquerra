"use client";

import type { ReactNode } from "react";
import Kbd from "@/components/ui/Kbd";
import { useHydrated } from "@/hooks/useHydrated";

type ShortcutButtonProps = {
  /** The letter pressed with Ctrl (or ⌘ on Apple devices). */
  shortcut: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  showShortcut?: boolean;
};

/** A button that opens a dialog, showing its Ctrl/⌘ + key shortcut. */
export default function ShortcutButton({
  shortcut,
  onClick,
  children,
  className = "",
  showShortcut = true,
}: ShortcutButtonProps) {
  // "Ctrl" during SSR, "⌘" once the client knows it is on an Apple platform.
  const hydrated = useHydrated();
  const modifier = hydrated && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-keyshortcuts={`Control+${shortcut} Meta+${shortcut}`}
      className={`press inline-flex items-center gap-2 ${className}`}
    >
      {children}
      {showShortcut && (
        <span className="inline-flex gap-1" aria-hidden="true">
          <Kbd>{modifier}</Kbd>
          <Kbd>{shortcut}</Kbd>
        </span>
      )}
    </button>
  );
}
