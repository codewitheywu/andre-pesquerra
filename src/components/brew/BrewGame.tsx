"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Kbd from "@/components/ui/Kbd";
import { brewReducer, initialBrewState, INGREDIENTS, matches, ROUND_SECONDS, statusText, type Ingredient } from "@/lib/brew";
import { playSound } from "@/lib/sound";
import Cup from "./Cup";
import IngredientPad from "./IngredientPad";
import MenuBoard from "./MenuBoard";

const BEST_KEY = "brew:best";

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function BrewGame({ onClose }: { onClose: () => void }) {
  const [state, dispatch] = useReducer(brewReducer, initialBrewState);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  // Only ever rendered in the browser (lazy-loaded on open), so storage is safe here.
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = state.score;
  }, [state.score]);

  // Keys go to the game as soon as it opens.
  useEffect(() => rootRef.current?.focus(), []);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const endsAt = Date.now() + ROUND_SECONDS * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setTimeLeft(left);
      if (left > 0) return;
      clearInterval(timer);
      dispatch({ type: "end" });
      const score = scoreRef.current;
      const beaten = score > readBest();
      if (beaten) {
        setBest(score);
        try {
          localStorage.setItem(BEST_KEY, String(score));
        } catch {
          // Storage blocked: the best score lasts for this visit.
        }
      }
      setNewBest(beaten);
      playSound(beaten ? "serve" : "toggle");
    }, 200);
    return () => clearInterval(timer);
  }, [state.phase]);

  function start() {
    setTimeLeft(ROUND_SECONDS);
    setNewBest(false);
    dispatch({ type: "start", now: Date.now() });
    rootRef.current?.focus();
  }

  function add(ingredient: Ingredient) {
    playSound("pour");
    dispatch({ type: "add", ingredient });
  }

  function serve() {
    if (!state.order || state.cup.length === 0) return;
    playSound(matches(state.cup, state.order) ? "serve" : "miss");
    dispatch({ type: "serve", now: Date.now() });
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    // A focused button handles its own Enter and Space.
    const onButton = (event.target as HTMLElement).closest("button") !== null;
    if (event.key === "Enter" && !onButton) {
      event.preventDefault();
      if (state.phase === "playing") serve();
      else start();
    } else if (state.phase === "playing" && event.key === "Backspace") {
      event.preventDefault();
      dispatch({ type: "dump" });
    } else if (state.phase === "playing") {
      const ingredient = INGREDIENTS.find((item) => item.key === event.key.toLowerCase());
      if (ingredient) {
        event.preventDefault();
        add(ingredient.id);
      }
    }
  }

  const status = state.phase === "playing" ? statusText(state) : "";
  const clock = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  return (
    <div ref={rootRef} tabIndex={-1} onKeyDown={onKeyDown} className="outline-none">
      <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
        <div>
          <p className="font-mono text-meta text-muted">mini game</p>
          <h2 className="text-h3 font-semibold text-ink">Brew</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close Brew" className="press -mr-2 inline-flex size-11 items-center justify-center rounded-md text-h3 text-muted hover:text-ink">
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {state.phase === "ready" && (
        <div className="grid gap-8 p-5 sm:grid-cols-[1fr_15rem] sm:p-6">
          <div>
            <p className="text-body text-ink-2">
              Orders come in one at a time. Build each drink from the menu, then serve it. You have{" "}
              {ROUND_SECONDS} seconds: quick serves and streaks score more.
            </p>
            <p className="mt-3 text-meta text-muted">
              Add with the letter keys, <Kbd>⌫</Kbd> dumps the cup, <Kbd>Enter</Kbd> serves. Tapping works too.
            </p>
            <button type="button" onClick={start} className="press mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 text-body text-bg hover:opacity-90">
              Start brewing <span className="font-mono text-meta opacity-80">Enter</span>
            </button>
            {best > 0 && <p className="mt-4 font-mono text-meta text-muted">best: {best}</p>}
          </div>
          <MenuBoard current={null} />
        </div>
      )}

      {state.phase === "playing" && state.order && (
        <div className="grid gap-8 p-5 sm:grid-cols-[1fr_15rem] sm:p-6">
          <div>
            <div className="flex items-baseline justify-between gap-4 font-mono text-meta text-muted">
              <span className={timeLeft <= 10 ? "text-accent" : ""}>{clock}</span>
              <span>
                score <span className="text-ink">{state.score}</span>
                {state.streak > 1 && <span className="ml-3 text-ink">×{Math.min(state.streak, 3)}</span>}
              </span>
            </div>
            <p className="mt-3 text-lead font-semibold text-ink">{state.order.name}</p>
            <p className="font-mono text-meta text-muted">
              {state.order.iced ? "iced" : "hot"}
              {/* Phones show the menu below the bar, so spell the recipe out here. */}
              <span className="sm:hidden">
                {" · "}
                {state.order.parts.map((part) => INGREDIENTS.find((item) => item.id === part)?.label).join(" + ")}
              </span>
            </p>
            <div className="my-4 flex justify-center">
              <Cup contents={state.cup} iced={state.order.iced} />
            </div>
            <p aria-live="polite" className="mb-4 min-h-6 text-meta text-ink-2">
              {status}
            </p>
            <IngredientPad onAdd={add} onDump={() => dispatch({ type: "dump" })} onServe={serve} canServe={state.cup.length > 0} />
          </div>
          <MenuBoard current={state.order} />
        </div>
      )}

      {state.phase === "over" && (
        <div role="status" className="p-5 sm:p-6">
          <p className="font-mono text-meta text-muted">time!</p>
          <p className="mt-1 text-h3 font-semibold text-ink">
            {state.served} {state.served === 1 ? "drink" : "drinks"} served, {state.score} points
          </p>
          <p className="mt-2 text-body text-ink-2">{newBest ? "A new best. The regulars are impressed." : `Best so far: ${best}.`}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={start} className="press inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 text-body text-bg hover:opacity-90">
              Brew again <span className="font-mono text-meta opacity-80">Enter</span>
            </button>
            <button type="button" onClick={onClose} className="press inline-flex min-h-11 items-center rounded-md border border-border px-5 text-body text-ink-2 hover:text-ink">
              Back to the site
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
