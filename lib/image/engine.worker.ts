import type Vips from "wasm-vips"

import type {
  EngineCommand,
  EngineCommands,
  EngineRequest,
  EngineResponse,
} from "./engine-protocol"
import {
  openSource,
  readInfo,
  render,
  renderReference,
  type RenderResult,
  type VipsInstance,
} from "./pipeline"

// Served from public/ (see scripts/copy-wasm-vips.mjs) and loaded at runtime,
// so the bundler leaves wasm-vips and its .wasm files untouched.
const VIPS_SCRIPT_URL = "/vendor/wasm-vips/vips-es6.js"

type CommandResult<C extends EngineCommand> = {
  result: EngineCommands[C]["result"]
  transfer?: Transferable[]
}

type Handlers = {
  [C in EngineCommand]: (
    vips: VipsInstance,
    params: EngineCommands[C]["params"]
  ) => CommandResult<C>
}

const sources = new Map<string, Vips.Image>()

function getSource(key: string) {
  const source = sources.get(key)
  if (!source) throw new Error(`No open image for key "${key}"`)
  return source
}

/** An ArrayBuffer holding exactly `bytes`, so it can be transferred. */
function ownBuffer(bytes: Uint8Array): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = bytes
  if (
    buffer instanceof ArrayBuffer &&
    byteOffset === 0 &&
    byteLength === buffer.byteLength
  ) {
    return buffer
  }
  return bytes.slice().buffer
}

function transferable({ data, width, height }: RenderResult) {
  const buffer = ownBuffer(data)
  return { result: { data: buffer, width, height }, transfer: [buffer] }
}

const handlers: Handlers = {
  open(vips, { key, data }) {
    sources.get(key)?.delete()
    const source = openSource(vips, data)
    sources.set(key, source)
    return { result: readInfo(source) }
  },
  render(_vips, { key, recipe }) {
    return transferable(render(getSource(key), recipe))
  },
  reference(_vips, { key, geometry }) {
    return transferable(renderReference(getSource(key), geometry))
  },
  close(_vips, { key }) {
    sources.get(key)?.delete()
    sources.delete(key)
    return { result: null }
  },
}

async function loadVips(): Promise<VipsInstance> {
  const { default: createVips }: { default: typeof Vips } = await import(
    /* webpackIgnore: true */ VIPS_SCRIPT_URL
  )
  // Only the HEIF module (AVIF) is needed; JPEG XL and SVG are left out.
  return createVips({ dynamicLibraries: ["vips-heif.wasm"] })
}

const vipsReady = loadVips()

function handle(vips: VipsInstance, request: EngineRequest) {
  // The request union guarantees params match the command; TypeScript can't
  // correlate the two through the lookup, hence the cast.
  const handler = handlers[request.command] as (
    vips: VipsInstance,
    params: EngineRequest["params"]
  ) => CommandResult<EngineCommand>
  return handler(vips, request.params)
}

function respond(response: EngineResponse, transfer: Transferable[] = []) {
  self.postMessage(response, { transfer })
}

// Requests run strictly in arrival order, so a `close` can never overtake
// the `open` it belongs to.
let queue = Promise.resolve()

self.addEventListener("message", (event: MessageEvent<EngineRequest>) => {
  const request = event.data
  queue = queue.then(async () => {
    try {
      const vips = await vipsReady
      const { result, transfer } = handle(vips, request)
      respond({ id: request.id, ok: true, result }, transfer)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      respond({ id: request.id, ok: false, error: message })
    }
  })
})
