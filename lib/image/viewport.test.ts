import { describe, expect, it } from "vitest"

import { clampView, fitView, MAX_SCALE, panBy, zoomAt } from "./viewport"

const canvas = { width: 1000, height: 800 }
const content = { width: 1600, height: 800 }

describe("fitView", () => {
  it("fits and centres large content", () => {
    const view = fitView(canvas, content)
    expect(view.scale).toBeCloseTo(0.575)
    expect(view.x).toBeCloseTo(40)
    expect(view.y).toBeCloseTo(170)
  })

  it("shows small content at 100%", () => {
    expect(fitView(canvas, { width: 200, height: 100 })).toEqual({
      scale: 1,
      x: 400,
      y: 350,
    })
  })
})

describe("zoomAt", () => {
  it("keeps the point under the cursor in place", () => {
    const view = { scale: 1, x: 0, y: 0 }
    const anchor = { x: 300, y: 200 }
    const zoomed = zoomAt(view, 2, anchor, canvas, content)

    expect(zoomed.scale).toBe(2)
    // Content point (300, 200) is still drawn at the anchor.
    expect(zoomed.x + 300 * zoomed.scale).toBe(anchor.x)
    expect(zoomed.y + 200 * zoomed.scale).toBe(anchor.y)
  })

  it("respects the zoom limits", () => {
    const view = fitView(canvas, content)
    const anchor = { x: 500, y: 400 }

    expect(zoomAt(view, 1000, anchor, canvas, content).scale).toBe(MAX_SCALE)
    expect(zoomAt(view, 0.0001, anchor, canvas, content).scale).toBeCloseTo(
      0.575 / 4
    )
  })
})

describe("panBy / clampView", () => {
  it("moves the content", () => {
    const view = { scale: 1, x: 0, y: 0 }
    expect(panBy(view, { x: -100, y: 50 }, canvas, content)).toEqual({
      scale: 1,
      x: -100,
      y: 50,
    })
  })

  it("never lets the content leave the canvas", () => {
    const far = clampView({ scale: 1, x: -5000, y: 5000 }, canvas, content)
    expect(far).toEqual({ scale: 1, x: 48 - 1600, y: 800 - 48 })
  })
})
