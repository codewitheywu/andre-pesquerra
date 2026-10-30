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

const REVEAL_VARS = ["--reveal-x", "--reveal-y", "--reveal-max", "--reveal-feather"];

/**
 * Switch theme with a circular reveal centred on `origin` (the button that
 * was pressed): dark pours outward from it, light draws back into it. The
 * circle has a soft, feathered edge and runs as a CSS animation
 * (globals.css), so its first and last frames are always right. Visitors
 * who prefer reduced motion get a plain crossfade; browsers without View
 * Transitions switch instantly.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  if (typeof document.startViewTransition !== "function" || theme === getTheme()) {
    applyTheme(theme);
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    root.dataset.themeTransition = "fade";
  } else {
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    // The feather is the soft band where the two themes blend.
    const feather = Math.max(96, radius * 0.18);
    root.style.setProperty("--reveal-x", `${x}px`);
    root.style.setProperty("--reveal-y", `${y}px`);
    root.style.setProperty("--reveal-max", `${Math.ceil(radius + feather)}px`);
    root.style.setProperty("--reveal-feather", `${Math.round(feather)}px`);
    root.dataset.themeTransition = theme === "dark" ? "outward" : "inward";
  }

  const transition = document.startViewTransition(() => applyTheme(theme));
  transition.finished.finally(() => {
    delete root.dataset.themeTransition;
    for (const name of REVEAL_VARS) root.style.removeProperty(name);
  });
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
