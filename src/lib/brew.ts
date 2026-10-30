// Brew: the coffee mini game's rules, kept free of React so they can be
// unit tested. An order comes in, the player adds ingredients to the cup,
// then serves it. A drink matches when it holds the right ingredients in
// the right amounts; the order they went in does not matter.

export type Ingredient = "espresso" | "water" | "milk" | "foam" | "caramel" | "ice";

export const INGREDIENTS: { id: Ingredient; label: string; key: string }[] = [
  { id: "espresso", label: "Espresso", key: "e" },
  { id: "water", label: "Water", key: "w" },
  { id: "milk", label: "Milk", key: "m" },
  { id: "foam", label: "Foam", key: "f" },
  { id: "caramel", label: "Caramel", key: "c" },
  { id: "ice", label: "Ice", key: "i" },
];

export type Recipe = { name: string; iced: boolean; parts: Ingredient[]; level: 1 | 2 | 3 };

/** The café menu, from the easiest drinks to the fussiest. */
export const RECIPES: Recipe[] = [
  { name: "Espresso", iced: false, parts: ["espresso"], level: 1 },
  { name: "Americano", iced: false, parts: ["espresso", "water"], level: 1 },
  { name: "Latte", iced: false, parts: ["espresso", "milk"], level: 1 },
  { name: "Doppio", iced: false, parts: ["espresso", "espresso"], level: 2 },
  { name: "Cappuccino", iced: false, parts: ["espresso", "milk", "foam"], level: 2 },
  { name: "Iced Americano", iced: true, parts: ["ice", "espresso", "water"], level: 2 },
  { name: "Iced Latte", iced: true, parts: ["ice", "espresso", "milk"], level: 2 },
  { name: "Caramel Latte", iced: false, parts: ["espresso", "milk", "caramel"], level: 3 },
  { name: "Iced Caramel Latte", iced: true, parts: ["ice", "espresso", "milk", "caramel"], level: 3 },
  { name: "Caramel Macchiato", iced: false, parts: ["caramel", "milk", "espresso", "foam"], level: 3 },
];

export const ROUND_SECONDS = 60;
export const CUP_SIZE = 6;
const QUICK_SERVE_MS = 4000;
const MAX_STREAK_BONUS = 3;

/** Same ingredients, same amounts, any order. */
export function matches(cup: Ingredient[], recipe: Recipe): boolean {
  if (cup.length !== recipe.parts.length) return false;
  const sorted = (list: Ingredient[]) => [...list].sort().join(",");
  return sorted(cup) === sorted(recipe.parts);
}

/** What the cup actually is, if it happens to be another drink on the menu. */
export function identify(cup: Ingredient[]): Recipe | undefined {
  return RECIPES.find((recipe) => matches(cup, recipe));
}

/** Harder drinks join the queue as the score grows. */
export function levelFor(served: number): 1 | 2 | 3 {
  return served >= 6 ? 3 : served >= 2 ? 2 : 1;
}

/** A random drink up to the current level, never the same one twice in a row. */
export function nextOrder(served: number, previous: Recipe | null, random = Math.random): Recipe {
  const level = levelFor(served);
  const choices = RECIPES.filter((recipe) => recipe.level <= level && recipe !== previous);
  return choices[Math.floor(random() * choices.length)] ?? RECIPES[0]!;
}

/** 10 a drink, times the streak (up to ×3), plus 5 for serving within 4s. */
export function pointsFor(streak: number, elapsedMs: number): number {
  const multiplier = Math.min(streak, MAX_STREAK_BONUS);
  return 10 * multiplier + (elapsedMs <= QUICK_SERVE_MS ? 5 : 0);
}

export type Feedback = { kind: "served"; points: number } | { kind: "wrong"; made: string } | { kind: "spilled" };

export type BrewState = {
  phase: "ready" | "playing" | "over";
  score: number;
  served: number;
  streak: number;
  order: Recipe | null;
  orderedAt: number;
  cup: Ingredient[];
  feedback: Feedback | null;
};

export type BrewAction =
  | { type: "start"; now: number; random?: () => number }
  | { type: "add"; ingredient: Ingredient }
  | { type: "dump" }
  | { type: "serve"; now: number; random?: () => number }
  | { type: "end" };

export const initialBrewState: BrewState = {
  phase: "ready",
  score: 0,
  served: 0,
  streak: 0,
  order: null,
  orderedAt: 0,
  cup: [],
  feedback: null,
};

export function brewReducer(state: BrewState, action: BrewAction): BrewState {
  switch (action.type) {
    case "start":
      return {
        ...initialBrewState,
        phase: "playing",
        order: nextOrder(0, null, action.random),
        orderedAt: action.now,
      };
    case "add": {
      if (state.phase !== "playing") return state;
      // One more than the cup holds spills it: start that drink again.
      if (state.cup.length >= CUP_SIZE) return { ...state, cup: [], streak: 0, feedback: { kind: "spilled" } };
      return { ...state, cup: [...state.cup, action.ingredient], feedback: null };
    }
    case "dump":
      return state.phase === "playing" ? { ...state, cup: [], feedback: null } : state;
    case "serve": {
      if (state.phase !== "playing" || !state.order || state.cup.length === 0) return state;
      if (!matches(state.cup, state.order)) {
        const made = identify(state.cup)?.name ?? "something new";
        return { ...state, cup: [], streak: 0, feedback: { kind: "wrong", made } };
      }
      const streak = state.streak + 1;
      const points = pointsFor(streak, action.now - state.orderedAt);
      const served = state.served + 1;
      return {
        ...state,
        score: state.score + points,
        served,
        streak,
        cup: [],
        order: nextOrder(served, state.order, action.random),
        orderedAt: action.now,
        feedback: { kind: "served", points },
      };
    }
    case "end":
      return state.phase === "playing" ? { ...state, phase: "over", cup: [] } : state;
  }
}

const withArticle = (name: string) => `${/^[AEIOU]/.test(name) ? "an" : "a"} ${name}`;

/** What happened last, in words: shown on screen and announced to screen readers. */
export function statusText(state: BrewState): string {
  const order = state.order?.name ?? "";
  switch (state.feedback?.kind) {
    case "served":
      return `Served, +${state.feedback.points}. Next: ${order}.`;
    case "wrong":
      return state.feedback.made === "something new"
        ? `That's not on the menu. Still waiting on ${withArticle(order)}.`
        : `That's ${withArticle(state.feedback.made)}, not ${withArticle(order)}.`;
    case "spilled":
      return "Spilled! Start that drink again.";
    default:
      return state.order ? `Order up: ${order}.` : "";
  }
}
