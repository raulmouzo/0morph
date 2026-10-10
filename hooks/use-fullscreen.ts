import { useEffect, useState } from "react"

/**
 * Full-screen mode for an editor-like view. `active` drives the layout (a
 * fixed overlay), and the page also enters browser full screen where the
 * Fullscreen API is available; on browsers without it (e.g. iPhone Safari)
 * the overlay alone fills the window. Esc leaves either way.
 */
export function useFullscreen() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!active) return
    // Leaving browser full screen (Esc, browser UI) leaves the mode too.
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setActive(false)
    }
    // Browsers usually consume Esc to leave full screen themselves; when it
    // reaches the page (no browser full screen, or the browser passes it
    // on), leave both.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setActive(false)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [active])

  function enter() {
    setActive(true)
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      // Rejection (e.g. denied by the browser) keeps the in-page overlay.
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  function exit() {
    setActive(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }

  return { active, enter, exit, toggle: () => (active ? exit() : enter()) }
}
