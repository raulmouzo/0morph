import { readFile } from "node:fs/promises"
import { join } from "node:path"

import Vips from "wasm-vips"

import type { VipsInstance } from "./pipeline"

let vips: Promise<VipsInstance> | undefined

/** Node build of wasm-vips, shared by every test file in a worker. */
export function loadVips() {
  vips ??= Vips({ dynamicLibraries: ["vips-heif.wasm"] })
  return vips
}

export function readSample(name: string) {
  return readFile(join(process.cwd(), "public", "samples", name))
}

export const SAMPLES = [
  "gradient-abstract.png",
  "wizard-portrait.webp",
  "cameraman-wide.jpg",
  "database-shelf.avif",
] as const
