import { describe, expect, it } from "vitest"

import { openSource, readInfo, render, renderReference } from "./pipeline"
import {
  flipGeometry,
  IDENTITY_GEOMETRY,
  OUTPUT_FORMATS,
  rotateGeometry,
  type Encoding,
  type Geometry,
  type ImageRecipe,
} from "./recipe"
import { loadVips, readSample, SAMPLES } from "./test-utils"

const LOADERS = {
  jpeg: "jpegload_buffer",
  png: "pngload_buffer",
  webp: "webpload_buffer",
  avif: "heifload_buffer",
} as const

const recipe = (
  encoding: Partial<Encoding> = {},
  geometry: Partial<Geometry> = {}
): ImageRecipe => ({
  geometry: { ...IDENTITY_GEOMETRY, ...geometry },
  encoding: { format: "webp", quality: 80, ...encoding },
})

describe("openSource", () => {
  it.each(SAMPLES)("decodes %s", async (name) => {
    const vips = await loadVips()
    const source = openSource(vips, await readSample(name))
    const info = readInfo(source)
    source.delete()

    expect(info.width).toBeGreaterThan(0)
    expect(info.height).toBeGreaterThan(0)
  })

  it("rejects data that isn't an image", async () => {
    const vips = await loadVips()
    expect(() => openSource(vips, new TextEncoder().encode("nope"))).toThrow()
  })
})

describe("render", () => {
  it.each(OUTPUT_FORMATS)("encodes to %s", async (format) => {
    const vips = await loadVips()
    const source = openSource(vips, await readSample("database-shelf.avif"))
    const output = render(source, recipe({ format }))
    const decoded = vips.Image.newFromBuffer(output.data)

    expect(decoded.getString("vips-loader")).toBe(LOADERS[format])
    expect([decoded.width, decoded.height]).toEqual([576, 720])
    expect([output.width, output.height]).toEqual([576, 720])
    decoded.delete()
    source.delete()
  })

  it("produces smaller files at lower quality", async () => {
    const vips = await loadVips()
    const source = openSource(vips, await readSample("cameraman-wide.jpg"))
    const high = render(source, recipe({ quality: 90 })).data.byteLength
    const low = render(source, recipe({ quality: 30 })).data.byteLength
    source.delete()

    expect(low).toBeLessThan(high)
  })

  it("flattens transparency onto white for JPEG", async () => {
    const vips = await loadVips()
    const transparent = vips.Image.black(8, 8, { bands: 4 })
      .copy({ interpretation: "srgb" })
      .cast("uchar")
    const output = render(transparent, recipe({ format: "jpeg" }))
    const decoded = vips.Image.newFromBuffer(output.data)

    expect(decoded.bands).toBe(3)
    expect(decoded.getpoint(4, 4).every((value) => value > 250)).toBe(true)
    decoded.delete()
    transparent.delete()
  })

  it.each([
    [{ resize: { width: 400, height: 400, keepAspect: true } }, [400, 200]],
    [{ resize: { width: 300, height: 500, keepAspect: false } }, [300, 500]],
    [{ maxDimension: 1280 }, [1280, 640]],
    [{ rotate: 90 as const, maxDimension: 1280 }, [640, 1280]],
  ])("resizes with %j to %j", async (changes, expected) => {
    const vips = await loadVips()
    const source = openSource(vips, await readSample("cameraman-wide.jpg"))
    const output = render(source, recipe({}, changes))
    const decoded = vips.Image.newFromBuffer(output.data)

    expect([output.width, output.height]).toEqual(expected)
    expect([decoded.width, decoded.height]).toEqual(expected)
    decoded.delete()
    source.delete()
  })

  it("keeps transparency when resizing", async () => {
    const vips = await loadVips()
    const transparent = vips.Image.black(64, 64, { bands: 4 })
      .copy({ interpretation: "srgb" })
      .cast("uchar")
    const resize = { width: 16, height: 16, keepAspect: true }
    const output = render(transparent, recipe({ format: "png" }, { resize }))
    const decoded = vips.Image.newFromBuffer(output.data)

    expect([decoded.width, decoded.height, decoded.bands]).toEqual([16, 16, 4])
    expect(decoded.getpoint(8, 8)[3]).toBe(0)
    decoded.delete()
    transparent.delete()
  })

  it("rotates the output dimensions", async () => {
    const vips = await loadVips()
    const source = openSource(vips, await readSample("cameraman-wide.jpg"))
    const output = render(source, recipe({}, { rotate: 90 }))
    source.delete()

    expect([output.width, output.height]).toEqual([800, 1600])
  })
})

describe("renderReference geometry", () => {
  // 3×2 image whose pixel values are their reading order:
  // 1 2 3
  // 4 5 6
  async function pixelsAfter(geometry: Geometry) {
    const vips = await loadVips()
    const pixels = new Uint8Array([1, 2, 3, 4, 5, 6])
    const source = vips.Image.newFromMemory(
      pixels,
      3,
      2,
      1,
      vips.BandFormat.uchar
    )
    const output = renderReference(source, geometry)
    const decoded = vips.Image.newFromBuffer(output.data)
    const rows = Array.from({ length: decoded.height }, (_, y) =>
      Array.from({ length: decoded.width }, (_, x) => decoded.getpoint(x, y)[0])
    )
    decoded.delete()
    source.delete()
    return rows
  }

  const geometry = (changes: Partial<Geometry>) => ({
    ...IDENTITY_GEOMETRY,
    ...changes,
  })

  it("rotates clockwise", async () => {
    expect(await pixelsAfter(geometry({ rotate: 90 }))).toEqual([
      [4, 1],
      [5, 2],
      [6, 3],
    ])
  })

  it("flips both axes", async () => {
    expect(await pixelsAfter(geometry({ flipHorizontal: true }))).toEqual([
      [3, 2, 1],
      [6, 5, 4],
    ])
    expect(await pixelsAfter(geometry({ flipVertical: true }))).toEqual([
      [4, 5, 6],
      [1, 2, 3],
    ])
  })

  it("rotating after a flip rotates the mirrored image", async () => {
    const mirrored = flipGeometry(IDENTITY_GEOMETRY, "horizontal")
    const rotated = rotateGeometry(mirrored, "clockwise")

    // The mirror [[3,2,1],[6,5,4]] turned 90° clockwise.
    expect(await pixelsAfter(rotated)).toEqual([
      [6, 3],
      [5, 2],
      [4, 1],
    ])
  })

  it("four rotations return to the start", async () => {
    let current = flipGeometry(IDENTITY_GEOMETRY, "vertical")
    for (let i = 0; i < 4; i++) current = rotateGeometry(current, "clockwise")

    expect(current).toEqual(flipGeometry(IDENTITY_GEOMETRY, "vertical"))
  })
})
