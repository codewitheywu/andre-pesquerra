import { useId } from "react";
import { CUP_SIZE, type Ingredient } from "@/lib/brew";

const FILL: Record<Ingredient, string> = {
  espresso: "var(--brew-espresso)",
  water: "var(--brew-water)",
  milk: "var(--brew-milk)",
  foam: "var(--brew-foam)",
  caramel: "var(--brew-caramel)",
  ice: "var(--brew-ice)",
};

// Glass for iced orders, a mug for hot ones. Inner area: top 24, bottom 126.
const TOP = 24;
const BOTTOM = 126;
const BAND = (BOTTOM - TOP) / CUP_SIZE;

/** The drink so far, poured in layers from the bottom. Decorative: the game announces contents in text. */
export default function Cup({ contents, iced }: { contents: Ingredient[]; iced: boolean }) {
  const clipId = useId();
  const inner = iced
    ? "M30 24 L90 24 L84 126 L36 126 Z"
    : "M26 34 L86 34 L86 118 Q86 126 78 126 L34 126 Q26 126 26 118 Z";

  return (
    <svg viewBox="0 0 120 140" aria-hidden="true" className="h-auto w-full max-w-44">
      <clipPath id={clipId}>
        <path d={inner} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {contents.map((ingredient, index) => {
          const y = BOTTOM - (index + 1) * BAND;
          return (
            <g key={`${index}-${ingredient}`} className="brew-pour">
              <rect x="0" y={y} width="120" height={BAND + 0.5} fill={FILL[ingredient]} />
              {ingredient === "ice" && (
                <>
                  <rect x="42" y={y + 3} width="11" height="11" rx="2" fill="none" stroke="var(--ink-2)" strokeOpacity="0.35" />
                  <rect x="64" y={y + 5} width="10" height="10" rx="2" fill="none" stroke="var(--ink-2)" strokeOpacity="0.35" />
                </>
              )}
              {ingredient === "foam" && (
                <>
                  <circle cx="48" cy={y + 6} r="2" fill="var(--brew-milk)" />
                  <circle cx="66" cy={y + 9} r="1.6" fill="var(--brew-milk)" />
                  <circle cx="78" cy={y + 5} r="1.3" fill="var(--brew-milk)" />
                </>
              )}
            </g>
          );
        })}
      </g>
      {iced ? (
        <path d="M27 18 L93 18 L86 130 L34 130 Z" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <>
          <path
            d="M22 30 L90 30 L90 118 Q90 130 78 130 L34 130 Q22 130 22 118 Z"
            fill="none"
            stroke="var(--ink-2)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M90 50 Q108 50 108 72 Q108 94 90 94" fill="none" stroke="var(--ink-2)" strokeWidth="2.5" />
        </>
      )}
    </svg>
  );
}
