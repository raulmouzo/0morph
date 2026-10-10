import { describe, expect, it } from "vitest"

import { uniqueNames } from "./batch"

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
