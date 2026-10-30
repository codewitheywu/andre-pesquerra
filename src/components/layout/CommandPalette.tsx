"use client";

import { useLenis } from "lenis/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { siteContent } from "@/data/content";
import { filterCommands, isSitePage, moveHighlight, runActionCommand } from "./paletteCommands";
import type { Command } from "./paletteCommands";

const OPEN_EVENT = "command-palette:open";

/** Open the palette from anywhere (sidebar hint, mobile menu button). */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export default function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lenis = useLenis();
  const router = useRouter();
  const listId = useId();

  const results = useMemo(() => filterCommands(query), [query]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    // A pending auto-close from "Copy email" must not close a reopened palette.
    clearTimeout(closeTimer.current);
    setQuery("");
    setActiveIndex(0);
    setNotice("");
    dialog.showModal();
    inputRef.current?.focus();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, open);
    };
  }, [open, close]);

  async function run(command: Command) {
    if (command.group === "Jump to" && command.target) {
      const id = command.target;
      const target = document.getElementById(id);
      close();
      if (!target) {
        // Not on the home page (e.g. /stack): go there instead.
        router.push(`/#${id}`);
        return;
      }
      history.pushState(null, "", `#${id}`);
      if (lenis) lenis.scrollTo(target);
      else target.scrollIntoView();
      // Move focus with the view so keyboard and screen reader users land there too.
      document.getElementById(`${id}-heading`)?.focus({ preventScroll: true });
      return;
    }

    if (command.id === "copy-email") {
      try {
        await navigator.clipboard.writeText(siteContent.email);
        setNotice("Email address copied ✓");
        closeTimer.current = setTimeout(close, 1200);
      } catch {
        setNotice(`Couldn't copy. The address is ${siteContent.email}`);
      }
      return;
    }

    const result = runActionCommand(command.id);
    if (result) {
      if ("notice" in result) setNotice(result.notice);
      else close();
      return;
    }

    if (command.group === "Links" && command.target) {
      close();
      // Site pages open in place; profiles and the résumé PDF in a new tab.
      if (isSitePage(command.target)) router.push(command.target);
      else window.open(command.target, "_blank", "noopener,noreferrer");
    }
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const next = moveHighlight(event.key, activeIndex, results.length);
    if (next !== null) {
      event.preventDefault();
      setActiveIndex(next);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = results[activeIndex];
      if (command) void run(command);
    }
  }

  const active = results[activeIndex];
  const activeId = active ? `${listId}-${active.id}` : undefined;

  // The list has no visible scrollbar, so keep the arrow-key choice in view.
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      className="palette m-auto mt-[12vh] max-h-[76dvh] w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border border-border bg-surface p-0 text-ink shadow-soft open:flex short:mt-[6vh] short:max-h-[88dvh]"
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4">
        <span aria-hidden="true" className="font-mono text-meta text-muted">
          ⌕
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-label="Search sections, links and actions"
          placeholder="Jump to a section or run an action…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onInputKeyDown}
          className="h-12 w-full bg-transparent text-body text-ink outline-none placeholder:text-muted"
        />
      </div>

      <ul id={listId} role="listbox" aria-label="Results" data-lenis-prevent className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {results.map((command, index) => {
          const selected = index === activeIndex;
          return (
            <li
              key={command.id}
              id={`${listId}-${command.id}`}
              role="option"
              aria-selected={selected}
              onMouseMove={() => setActiveIndex(index)}
              onClick={() => void run(command)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-md px-3 text-body pointer-fine:min-h-9 ${
                selected ? "bg-surface-2 text-ink" : "text-ink-2"
              }`}
            >
              <span>
                <span className="sr-only">{command.group}: </span>
                {command.label}
              </span>
              <span aria-hidden="true" className="font-mono text-meta text-muted">
                {command.hint}
              </span>
            </li>
          );
        })}
      </ul>

      {results.length === 0 && (
        <p className="px-5 pb-5 text-body text-muted">
          Nothing matches “{query}”. Try “projects” or “email”.
        </p>
      )}

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border px-4 py-2 font-mono text-meta text-muted">
        <span aria-live="polite">{notice || "↑↓ to move · enter to select"}</span>
        <span>esc to close</span>
      </div>
    </dialog>
  );
}
