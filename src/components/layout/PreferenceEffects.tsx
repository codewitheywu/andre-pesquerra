"use client";

import { useEffect } from "react";
import { useTheme } from "@/hooks/usePreferences";
import { playSound } from "@/lib/sound";
import { syncThemeColor } from "@/lib/theme";

/**
 * Page-wide side effects of the visitor's preferences, mounted once:
 * the browser UI colour follows the theme, and clicks on links and
 * buttons tap when sound effects are on.
 */
export default function PreferenceEffects() {
  const theme = useTheme();

  useEffect(() => {
    if (theme) syncThemeColor(theme);
  }, [theme]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as Element | null;
      if (target?.closest("a, button, [role='option']")) playSound("tap");
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
