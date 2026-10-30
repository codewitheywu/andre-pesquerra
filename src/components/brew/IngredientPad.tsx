import Kbd from "@/components/ui/Kbd";
import { INGREDIENTS, type Ingredient } from "@/lib/brew";

type IngredientPadProps = {
  onAdd: (ingredient: Ingredient) => void;
  onDump: () => void;
  onServe: () => void;
  canServe: boolean;
};

// Clicking must not move focus onto the button: Enter would then press that
// button again instead of serving. Keyboard users can still Tab to them.
const keepFocus = (event: React.MouseEvent) => event.preventDefault();

const PAD_BUTTON =
  "press inline-flex min-h-11 items-center justify-between gap-2 rounded-md border border-border bg-bg px-3 text-body text-ink transition-colors hover:border-muted";

/** The bar: one button per ingredient, then dump and serve. Each shows its key. */
export default function IngredientPad({ onAdd, onDump, onServe, canServe }: IngredientPadProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {INGREDIENTS.map((ingredient) => (
          <button
            key={ingredient.id}
            type="button"
            onMouseDown={keepFocus}
            onClick={() => onAdd(ingredient.id)}
            aria-keyshortcuts={ingredient.key}
            className={PAD_BUTTON}
          >
            {ingredient.label}
            <Kbd>{ingredient.key.toUpperCase()}</Kbd>
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onMouseDown={keepFocus} onClick={onDump} aria-keyshortcuts="Backspace" className={`${PAD_BUTTON} flex-1`}>
          Dump
          <Kbd>⌫</Kbd>
        </button>
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={onServe}
          disabled={!canServe}
          aria-keyshortcuts="Enter"
          className="press inline-flex min-h-11 flex-1 items-center justify-between gap-2 rounded-md bg-ink px-3 text-body text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Serve
          <span className="font-mono text-meta opacity-80">Enter</span>
        </button>
      </div>
    </div>
  );
}
