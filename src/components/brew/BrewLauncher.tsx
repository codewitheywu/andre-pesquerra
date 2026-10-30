"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";

const OPEN_EVENT = "brew:open";

// The game's code downloads the first time someone opens it, never with the page.
const BrewGame = lazy(() => import("./BrewGame"));

/** Open Brew from anywhere (palette command, sidebar, footer). */
export function openBrew() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * Brew, the coffee mini game, in a native modal dialog (focus trap and Esc
 * for free). Ctrl/⌘ + G opens or closes it. That is the browser's "find
 * next" only while its find bar has focus, which never reaches the page.
 */
export default function BrewLauncher() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setOpen(true);
    dialog.showModal();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "g") {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else show();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [show, close]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Brew, a coffee mini game"
      data-lenis-prevent
      // Closing unmounts the game, so every visit starts a fresh round.
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="palette m-auto max-h-[calc(100dvh-32px)] w-[min(760px,calc(100vw-32px))] overflow-y-auto overscroll-contain rounded-lg border border-border bg-surface p-0 text-ink shadow-soft"
    >
      {open && (
        <Suspense fallback={<p className="p-8 font-mono text-meta text-muted">Heating up the machine…</p>}>
          <BrewGame onClose={close} />
        </Suspense>
      )}
    </dialog>
  );
}
