import { describe, expect, it } from "vitest"

import { pruneSelection, select, selectModeOf, selectOne } from "./selection"

const order = ["a", "b", "c", "d", "e"]

describe("select", () => {
  it("picks a single item on a plain click", () => {
    const current = { ids: ["a", "b"], anchor: "a", active: "b" }
    expect(select(order, current, "d", "single")).toEqual(selectOne("d"))
  })

  it("toggles items in and out with Ctrl/⌘", () => {
    let current = selectOne("a")
    current = select(order, current, "c", "toggle")
    expect(current).toEqual({ ids: ["a", "c"], anchor: "c", active: "c" })
    current = select(order, current, "c", "toggle")
    expect(current).toEqual({ ids: ["a"], anchor: "c", active: "a" })
  })

  it("keeps the last item selected", () => {
    const current = selectOne("a")
    expect(select(order, current, "a", "toggle")).toBe(current)
  })

  it("selects the range from the anchor with Shift, both ways", () => {
    const current = selectOne("b")
    expect(select(order, current, "d", "range")).toEqual({
      ids: ["b", "c", "d"],
      anchor: "b",
      active: "d",
    })
    const back = select(
      order,
      select(order, current, "d", "range"),
      "a",
      "range"
    )
    expect(back).toEqual({ ids: ["a", "b"], anchor: "b", active: "a" })
  })
})

describe("selectModeOf", () => {
  it("reads the modifier keys", () => {
    const keys = { shiftKey: false, ctrlKey: false, metaKey: false }
    expect(selectModeOf(keys)).toBe("single")
    expect(selectModeOf({ ...keys, metaKey: true })).toBe("toggle")
    expect(selectModeOf({ ...keys, ctrlKey: true })).toBe("toggle")
    expect(selectModeOf({ ...keys, shiftKey: true, ctrlKey: true })).toBe(
      "range"
    )
  })
})

describe("pruneSelection", () => {
  it("drops removed items and moves the focus if needed", () => {
    const current = { ids: ["b", "c"], anchor: "b", active: "c" }
    expect(pruneSelection(["a", "b", "d"], current)).toEqual({
      ids: ["b"],
      anchor: "b",
      active: "b",
    })
  })

  it("falls back to the first item when nothing selected is left", () => {
    expect(pruneSelection(["d", "e"], selectOne("a"))).toEqual(selectOne("d"))
  })
})
