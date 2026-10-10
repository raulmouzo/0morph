import { describe, expect, it } from "vitest"

import { openSource, readInfo, render } from "./pipeline"
import { OUTPUT_FORMATS, type ImageRecipe } from "./recipe"
import { loadVips, readSample, SAMPLES } from "./test-utils"

const LOADERS = {
  jpeg: "jpegload_buffer",
  png: "pngload_buffer",
  webp: "webpload_buffer",
  avif: "heifload_buffer",
} as const

const recipe = (overrides: Partial<ImageRecipe> = {}): ImageRecipe => ({
  format: "webp",
  quality: 80,
  ...overrides,
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
    expect([decoded.width, decoded.height]).toEqual([source.width, 720])
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
})
