import type { ImageInfo } from "./pipeline"
import type { ImageRecipe } from "./recipe"

export type RenderOutput = {
  data: ArrayBuffer
  width: number
  height: number
}

/** Commands the image engine worker understands, with their payloads. */
export type EngineCommands = {
  /** Decodes an image and keeps it in the worker under `key`. */
  open: { params: { key: string; data: ArrayBuffer }; result: ImageInfo }
  /** Applies a recipe to an open image and returns the encoded file. */
  render: {
    params: { key: string; recipe: ImageRecipe }
    result: RenderOutput
  }
  /** Releases an image opened with `open`. */
  close: { params: { key: string }; result: null }
}

export type EngineCommand = keyof EngineCommands

export type EngineRequest = {
  [C in EngineCommand]: {
    id: number
    command: C
    params: EngineCommands[C]["params"]
  }
}[EngineCommand]

export type EngineResponse =
  | { id: number; ok: true; result: EngineCommands[EngineCommand]["result"] }
  | { id: number; ok: false; error: string }
