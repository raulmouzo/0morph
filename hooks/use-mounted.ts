import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

/**
 * Returns false during SSR and the initial client render, true after
 * hydration. Use to gate client-only values (e.g. resolved theme) so the
 * pre-hydration render matches the server and avoids hydration mismatches.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}
