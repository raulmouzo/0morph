import { describe, expect, it } from "vitest"

import {
  IDENTITY_GEOMETRY,
  outputSize,
  rotateGeometry,
  type Geometry,
} from "./recipe"

const geometry = (changes: Partial<Geometry>): Geometry => ({
  ...IDENTITY_GEOMETRY,
  ...changes,
})

const source = { width: 1600, height: 800 }

describe("outputSize", () => {
  it("keeps the source size without edits", () => {
    expect(outputSize(source, IDENTITY_GEOMETRY)).toEqual(source)
  })

  it("swaps dimensions for quarter turns", () => {
    expect(outputSize(source, geometry({ rotate: 90 }))).toEqual({
      width: 800,
      height: 1600,
    })
  })

  it("fits inside the resize box when keeping the aspect ratio", () => {
    const resize = { width: 400, height: 400, keepAspect: true }
    expect(outputSize(source, geometry({ resize }))).toEqual({
      width: 400,
      height: 200,
    })
  })

  it("stretches to the exact size otherwise", () => {
    const resize = { width: 400, height: 400, keepAspect: false }
    expect(outputSize(source, geometry({ resize }))).toEqual({
      width: 400,
      height: 400,
    })
  })

  it("limits the longest side", () => {
    expect(outputSize(source, geometry({ maxDimension: 1280 }))).toEqual({
      width: 1280,
      height: 640,
    })
  })

  it("never enlarges to reach the max dimension", () => {
    expect(outputSize(source, geometry({ maxDimension: 3840 }))).toEqual(source)
  })

  it("applies the max dimension after resizing", () => {
    const resize = { width: 3200, height: 1600, keepAspect: true }
    expect(
      outputSize(source, geometry({ resize, maxDimension: 1920 }))
    ).toEqual({ width: 1920, height: 960 })
  })
})

describe("rotateGeometry", () => {
  it("turns the resize box with the image", () => {
    const resize = { width: 400, height: 200, keepAspect: false }
    const rotated = rotateGeometry(geometry({ resize }), "clockwise")

    expect(rotated.resize).toEqual({
      width: 200,
      height: 400,
      keepAspect: false,
    })
    expect(outputSize(source, rotated)).toEqual({ width: 200, height: 400 })
  })
})
