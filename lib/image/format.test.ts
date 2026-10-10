import { describe, expect, it } from "vitest"

import { formatBytes, formatSizeChange, outputFileName } from "./format"

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

describe("formatSizeChange", () => {
  it.each([
    [1000, 370, "−63%"],
    [1000, 1120, "+12%"],
    [1000, 1000, "0%"],
    [1000, 1001, "+0.1%"],
    [1_845_000, 4870, "−99.7%"],
    [0, 10, "—"],
  ])("from %d to %d is %s", (before, after, expected) => {
    expect(formatSizeChange(before, after)).toBe(expected)
  })
})

describe("outputFileName", () => {
  it.each([
    ["photo.png", "webp", "photo.webp"],
    ["my.holiday.photo.jpeg", "jpeg", "my.holiday.photo.jpg"],
    ["no-extension", "avif", "no-extension.avif"],
    [".hidden", "png", ".hidden.png"],
  ] as const)("%s as %s is %s", (name, format, expected) => {
    expect(outputFileName(name, format)).toBe(expected)
  })
})
