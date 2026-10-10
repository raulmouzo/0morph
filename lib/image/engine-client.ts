import type {
  EngineCommand,
  EngineCommands,
  EngineRequest,
  EngineResponse,
} from "./engine-protocol"

type Pending = {
  resolve: (result: EngineResponse & { ok: true }) => void
  reject: (error: Error) => void
}

/**
 * Main-thread handle to the image engine worker. Every call returns a
 * promise resolved with the worker's typed result.
 */
export class ImageEngine {
  #worker: Worker
  #nextId = 1
  #pending = new Map<number, Pending>()

  constructor() {
    this.#worker = new Worker(new URL("./engine.worker.ts", import.meta.url), {
      type: "module",
      name: "image-engine",
    })
    this.#worker.addEventListener(
      "message",
      (event: MessageEvent<EngineResponse>) => {
        const response = event.data
        const pending = this.#pending.get(response.id)
        if (!pending) return
        this.#pending.delete(response.id)
        if (response.ok) pending.resolve(response)
        else pending.reject(new Error(response.error))
      }
    )
    this.#worker.addEventListener("error", (event) => {
      const error = new Error(event.message || "Image engine failed to start")
      for (const pending of this.#pending.values()) pending.reject(error)
      this.#pending.clear()
    })
  }

  async call<C extends EngineCommand>(
    command: C,
    params: EngineCommands[C]["params"],
    transfer: Transferable[] = []
  ): Promise<EngineCommands[C]["result"]> {
    const id = this.#nextId++
    const response = await new Promise<EngineResponse & { ok: true }>(
      (resolve, reject) => {
        this.#pending.set(id, { resolve, reject })
        this.#worker.postMessage({ id, command, params } as EngineRequest, {
          transfer,
        })
      }
    )
    return response.result as EngineCommands[C]["result"]
  }
}

let engine: ImageEngine | null = null

/**
 * The engine is created on first use and kept for the lifetime of the page,
 * so wasm-vips is downloaded and compiled only once.
 */
export function getImageEngine() {
  engine ??= new ImageEngine()
  return engine
}
