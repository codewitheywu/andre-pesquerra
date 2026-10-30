import { describe, expect, it } from "vitest";
import {
  brewReducer,
  CUP_SIZE,
  identify,
  initialBrewState,
  matches,
  nextOrder,
  pointsFor,
  RECIPES,
  statusText,
  type BrewState,
} from "@/lib/brew";

const recipe = (name: string) => RECIPES.find((r) => r.name === name)!;
const first = () => 0; // always picks the first eligible drink

function playing(order: string, overrides: Partial<BrewState> = {}): BrewState {
  return { ...initialBrewState, phase: "playing", order: recipe(order), orderedAt: 0, ...overrides };
}

describe("brew rules", () => {
  it("matches ingredients and amounts in any order", () => {
    expect(matches(["milk", "espresso", "foam"], recipe("Cappuccino"))).toBe(true);
    expect(matches(["espresso", "milk"], recipe("Cappuccino"))).toBe(false);
    expect(matches(["espresso"], recipe("Doppio"))).toBe(false);
    expect(identify(["water", "espresso"])?.name).toBe("Americano");
  });

  it("every recipe on the menu is unique, so a cup is never two drinks", () => {
    const keys = RECIPES.map((r) => [...r.parts].sort().join(","));
    expect(new Set(keys).size).toBe(RECIPES.length);
    expect(RECIPES.every((r) => r.parts.length <= CUP_SIZE)).toBe(true);
  });

  it("starts easy and never repeats the previous order", () => {
    expect(nextOrder(0, null, first).level).toBe(1);
    const latte = recipe("Latte");
    for (let i = 0; i < 20; i++) expect(nextOrder(0, latte, Math.random)).not.toBe(latte);
    expect(RECIPES.some((r) => r.level === 3 && r === nextOrder(10, null, () => 0.99))).toBe(true);
  });

  it("scores streaks up to x3 plus a quick-serve bonus", () => {
    expect(pointsFor(1, 6000)).toBe(10);
    expect(pointsFor(2, 3000)).toBe(25);
    expect(pointsFor(9, 9000)).toBe(30);
  });
});

describe("brewReducer", () => {
  it("serving the right drink scores, clears the cup and brings the next order", () => {
    let state = playing("Latte");
    state = brewReducer(state, { type: "add", ingredient: "milk" });
    state = brewReducer(state, { type: "add", ingredient: "espresso" });
    state = brewReducer(state, { type: "serve", now: 2000, random: first });
    expect(state).toMatchObject({ score: 15, served: 1, streak: 1, cup: [], feedback: { kind: "served", points: 15 } });
    expect(state.order).not.toBe(recipe("Latte"));
  });

  it("serving the wrong drink names what was made and breaks the streak", () => {
    let state = playing("Cappuccino", { streak: 2 });
    state = brewReducer(state, { type: "add", ingredient: "espresso" });
    state = brewReducer(state, { type: "add", ingredient: "water" });
    state = brewReducer(state, { type: "serve", now: 1000 });
    expect(state).toMatchObject({ streak: 0, score: 0, cup: [], feedback: { kind: "wrong", made: "Americano" } });
    expect(state.order?.name).toBe("Cappuccino");
  });

  it("overfilling spills the cup; an empty cup cannot be served", () => {
    let state = playing("Latte", { cup: Array(CUP_SIZE).fill("milk") });
    state = brewReducer(state, { type: "add", ingredient: "milk" });
    expect(state).toMatchObject({ cup: [], feedback: { kind: "spilled" } });
    expect(brewReducer(state, { type: "serve", now: 0 })).toBe(state);
  });

  it("ignores input outside a round and ends cleanly", () => {
    expect(brewReducer(initialBrewState, { type: "add", ingredient: "ice" })).toBe(initialBrewState);
    const over = brewReducer(playing("Latte", { score: 40 }), { type: "end" });
    expect(over).toMatchObject({ phase: "over", score: 40 });
    const restarted = brewReducer(over, { type: "start", now: 5, random: first });
    expect(restarted).toMatchObject({ phase: "playing", score: 0, served: 0, orderedAt: 5 });
  });
});

describe("statusText", () => {
  it("names the order, the points, the mix-up or the spill", () => {
    expect(statusText(playing("Latte"))).toBe("Order up: Latte.");
    expect(statusText(playing("Espresso", { feedback: { kind: "served", points: 15 } }))).toBe("Served, +15. Next: Espresso.");
    expect(statusText(playing("Iced Latte", { feedback: { kind: "wrong", made: "Americano" } }))).toBe(
      "That's an Americano, not an Iced Latte."
    );
    expect(statusText(playing("Latte", { feedback: { kind: "wrong", made: "something new" } }))).toBe(
      "That's not on the menu. Still waiting on a Latte."
    );
    expect(statusText(playing("Latte", { feedback: { kind: "spilled" } }))).toBe("Spilled! Start that drink again.");
  });
});
