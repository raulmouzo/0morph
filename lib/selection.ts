/**
 * Multi-selection over an ordered list, like a file manager: a plain click
 * picks one item, Ctrl/⌘+click toggles one, Shift+click selects the range
 * from the anchor (the last item clicked without Shift).
 */
export type Selection = {
  /** Selected ids, never empty. */
  ids: string[]
  /** Where the next Shift+click range starts. */
  anchor: string
  /** The item in focus (e.g. the one previewed). Always selected. */
  active: string
}

export type SelectMode = "single" | "toggle" | "range"

export const selectOne = (id: string): Selection => ({
  ids: [id],
  anchor: id,
  active: id,
})

/** Mode for a click, from its modifier keys. */
export function selectModeOf(event: {
  shiftKey: boolean
  ctrlKey: boolean
  metaKey: boolean
}): SelectMode {
  if (event.shiftKey) return "range"
  if (event.ctrlKey || event.metaKey) return "toggle"
  return "single"
}

export function select(
  order: string[],
  current: Selection,
  id: string,
  mode: SelectMode
): Selection {
  if (mode === "single") return selectOne(id)

  if (mode === "range") {
    const from = order.indexOf(current.anchor)
    const to = order.indexOf(id)
    if (from === -1) return selectOne(id)
    const [start, end] = from < to ? [from, to] : [to, from]
    return {
      ids: order.slice(start, end + 1),
      anchor: current.anchor,
      active: id,
    }
  }

  if (!current.ids.includes(id)) {
    return { ids: [...current.ids, id], anchor: id, active: id }
  }
  // The last selected item can't be toggled off.
  if (current.ids.length === 1) return current
  const ids = current.ids.filter((selected) => selected !== id)
  const active = current.active === id ? ids[ids.length - 1] : current.active
  return { ids, anchor: id, active }
}

/** Drops ids that are no longer in `order`, keeping the selection valid. */
export function pruneSelection(order: string[], current: Selection): Selection {
  const ids = current.ids.filter((id) => order.includes(id))
  if (ids.length === current.ids.length) return current
  if (ids.length === 0) return selectOne(order[0])
  const active = ids.includes(current.active) ? current.active : ids[0]
  const anchor = ids.includes(current.anchor) ? current.anchor : active
  return { ids, anchor, active }
}
