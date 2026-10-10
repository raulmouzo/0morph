import { describe, expect, it } from "vitest"

import { openSource, readInfo } from "./pipeline"
import { loadVips, readSample, SAMPLES } from "./test-utils"

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
