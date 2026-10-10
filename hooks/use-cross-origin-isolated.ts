import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

/**
 * Whether the page is cross-origin isolated (required for
 * SharedArrayBuffer). Returns null during SSR and the initial client
 * render, where it can't be known yet.
 */
export function useCrossOriginIsolated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.crossOriginIsolated,
    () => null
  )
}
