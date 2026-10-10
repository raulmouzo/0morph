import type { ImageInfo } from "./pipeline"

/** Commands the image engine worker understands, with their payloads. */
export type EngineCommands = {
  /** Decodes an image and keeps it in the worker under `key`. */
  open: { params: { key: string; data: ArrayBuffer }; result: ImageInfo }
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
