import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false during SSR and hydration, true once the client has taken over.
 * Lets components render client-only details without a hydration mismatch
 * and without setState in an effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
