import { describe, expect, it } from "vitest"

import { renderBatch, uniqueNames } from "./batch"
import type { ImageEngine } from "./engine-client"
import { initialRecipe, type ImageRecipe } from "./recipe"

describe("uniqueNames", () => {
  it("numbers repeated names before the extension", () => {
    expect(
      uniqueNames(["a.webp", "b.webp", "a.webp", "A.webp", "a.webp"])
    ).toEqual(["a.webp", "b.webp", "a (2).webp", "A (3).webp", "a (4).webp"])
  })

  it("handles names without an extension", () => {
    expect(uniqueNames(["photo", "photo"])).toEqual(["photo", "photo (2)"])
  })

  it("doesn't collide with a name that already has a number", () => {
    expect(uniqueNames(["a (2).png", "a.png", "a.png"])).toEqual([
      "a (2).png",
      "a.png",
      "a (3).png",
    ])
  })
})

describe("renderBatch", () => {
  it("renders each file with its own recipe", async () => {
    const rendered: ImageRecipe[] = []
    const engine = {
      call: async (command: string, params: { recipe?: ImageRecipe }) => {
        if (command === "render") {
          rendered.push(params.recipe!)
          return { data: new ArrayBuffer(1), width: 1, height: 1 }
        }
        return null
      },
    } as unknown as ImageEngine
    const png = initialRecipe("image/png")
    const jpeg = initialRecipe("image/jpeg")

    const results = await renderBatch(engine, [
      { file: new File(["a"], "a.png", { type: "image/png" }), recipe: png },
      { file: new File(["b"], "b.jpg", { type: "image/jpeg" }), recipe: jpeg },
    ])

    expect(rendered).toEqual([png, jpeg])
    expect(results.map((result) => result.name)).toEqual(["a.png", "b.jpg"])
  })
})
