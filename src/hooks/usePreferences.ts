import { useSyncExternalStore } from "react";
import { getSoundEnabled, subscribeSound } from "@/lib/sound";
import { getTheme, subscribeTheme, type Theme } from "@/lib/theme";

/** The active theme, or null during SSR and hydration (it isn't known yet). */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribeTheme, getTheme, () => null);
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(subscribeSound, getSoundEnabled, () => false);
}
