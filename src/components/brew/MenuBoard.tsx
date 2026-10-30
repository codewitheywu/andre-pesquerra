import { INGREDIENTS, RECIPES, type Recipe } from "@/lib/brew";

const KEY_OF = Object.fromEntries(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient.key.toUpperCase()]));

/** The café menu: every drink and the keys that make it. The current order is marked. */
export default function MenuBoard({ current }: { current: Recipe | null }) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-meta text-muted">menu</h3>
      <ul className="space-y-1">
        {RECIPES.map((recipe) => {
          const isOrder = recipe === current;
          return (
            <li
              key={recipe.name}
              aria-current={isOrder ? "true" : undefined}
              className={`flex items-center gap-2 text-meta ${isOrder ? "font-medium text-ink" : "text-ink-2"}`}
            >
              <span>{recipe.name}</span>
              <span
                aria-hidden="true"
                className={`leader flex-1 ${isOrder ? "[--leader-line:var(--accent)]" : ""}`}
              />
              <span className="font-mono text-muted">
                <span className="sr-only">: </span>
                {recipe.parts.map((part) => KEY_OF[part]).join(" ")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
