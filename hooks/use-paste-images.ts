import { useEffect, useEffectEvent } from "react"

const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "file",
  "radio",
  "range",
  "reset",
  "submit",
])

/** Whether pasting into `target` should paste text instead of images. */
function isTextField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) {
    return true
  }
  return target instanceof HTMLInputElement && !NON_TEXT_INPUTS.has(target.type)
}

/**
 * Calls `onImages` with the images pasted anywhere on the page (Ctrl/⌘+V),
 * e.g. a screenshot or an image copied from another app. Pastes into text
 * fields are left alone.
 */
export function usePasteImages(onImages: (files: File[]) => void) {
  const onPaste = useEffectEvent((event: ClipboardEvent) => {
    if (isTextField(event.target)) return
    const images = Array.from(event.clipboardData?.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    )
    if (images.length === 0) return
    event.preventDefault()
    onImages(images)
  })

  useEffect(() => {
    const listener = (event: ClipboardEvent) => onPaste(event)
    document.addEventListener("paste", listener)
    return () => document.removeEventListener("paste", listener)
  }, [])
}
