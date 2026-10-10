import { describe, expect, it } from "vitest"

import { formatBytes } from "./format"

describe("formatBytes", () => {
  it.each([
    [0, "0 B"],
    [512, "512 B"],
    [1536, "1.50 KB"],
    [190_000, "185.5 KB"],
    [5 * 1024 * 1024, "5.00 MB"],
  ])("formats %d as %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected)
  })
})
