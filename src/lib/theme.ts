// Theme state lives on <html data-theme>. Without it, the OS preference
// decides (globals.css). The inline THEME_SCRIPT restores a saved choice
// before first paint, so a returning visitor never sees the wrong theme.

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const CHANGE_EVENT = "theme:change";

/** Page background per theme, for the browser UI colour (theme-color). */
export const THEME_COLORS: Record<Theme, string> = {
  light: "#f6efe6",
  dark: "#17110d",
};

export const THEME_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function getTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return darkQuery().matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode): the choice lasts for this page view.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Ease in and out: a strong ease-out sweeps half the screen in ~80ms, which
// reads as a flash rather than coffee pouring in.
const REVEAL_MS = 850;
const REVEAL_EASE = "cubic-bezier(0.5, 0, 0.25, 1)";

/**
 * Switch theme with a circular reveal centred on `origin` (the button that
 * was pressed): dark pours outward from it, light draws back into it.
 * Falls back to an instant switch without View Transitions or when the
 * visitor prefers reduced motion.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition !== "function" || reduceMotion || theme === getTheme()) {
    applyTheme(theme);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const outward = theme === "dark";
  const circles = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];

  // Outward animates the new view growing on top; inward animates the old
  // view shrinking, which must sit above the new one (globals.css).
  root.dataset.themeTransition = outward ? "outward" : "inward";
  const transition = document.startViewTransition(() => applyTheme(theme));
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: outward ? circles : [...circles].reverse() },
        {
          duration: REVEAL_MS,
          easing: REVEAL_EASE,
          // Hold the last frame until the transition tears down. Without it the
          // shrunken old (dark) view springs back to full size for a few frames
          // and the page flashes dark after switching to light.
          fill: "forwards",
          pseudoElement: outward ? "::view-transition-new(root)" : "::view-transition-old(root)",
        }
      );
    })
    .catch(() => {
      // Transition skipped (e.g. another one started); the theme is applied.
    });
  transition.finished.finally(() => delete root.dataset.themeTransition);
}

export function subscribeTheme(onChange: () => void) {
  const query = darkQuery();
  query.addEventListener("change", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Match the browser's address bar to the active theme. */
export function syncThemeColor(theme: Theme) {
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = THEME_COLORS[theme];
  }
}
