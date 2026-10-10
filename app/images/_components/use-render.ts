import { useEffect, useRef, useState } from "react"

import type { RenderOutput } from "@/lib/image/engine-protocol"
import { getImageEngine, type ImageEngine } from "@/lib/image/engine-client"
import { createLatestRunner } from "@/lib/image/latest-runner"
import { FORMATS, type Geometry, type ImageRecipe } from "@/lib/image/recipe"

export type Rendered<Input> = {
  url: string
  size: number
  width: number
  height: number
  /** The input that produced this output. */
  input: Input
}

type RenderState<Input> = {
  key: string
  input: Input
  output: Rendered<Input> | null
  error: string | null
}

type Renderer<Input> = {
  request: (
    engine: ImageEngine,
    key: string,
    input: Input
  ) => Promise<RenderOutput>
  mime: (input: Input) => string
}

/**
 * Renders the image opened under `key` from `input` whenever either
 * changes. While a render runs, only the latest input is queued, so fast
 * edits never pile up work in the engine. Pass a null key to render nothing.
 */
function useEngineOutput<Input>(
  key: string | null,
  input: Input,
  renderer: Renderer<Input>
) {
  const [state, setState] = useState<RenderState<Input> | null>(null)
  const runnerRef = useRef<{ request: (input: Input) => void }>(null)

  useEffect(() => {
    if (!key) return
    const engine = getImageEngine()
    const runner = createLatestRunner(
      (next: Input) => renderer.request(engine, key, next),
      (next, result) => {
        if (result.ok) {
          const { data, width, height } = result.value
          const blob = new Blob([data], { type: renderer.mime(next) })
          const url = URL.createObjectURL(blob)
          const size = data.byteLength
          setState({
            key,
            input: next,
            output: { url, size, width, height, input: next },
            error: null,
          })
        } else {
          const error =
            result.error instanceof Error
              ? result.error.message
              : String(result.error)
          setState((previous) => ({
            key,
            input: next,
            output: previous?.key === key ? previous.output : null,
            error,
          }))
        }
      }
    )
    runnerRef.current = runner
    return () => {
      runner.dispose()
      runnerRef.current = null
    }
  }, [key, renderer])

  useEffect(() => {
    runnerRef.current?.request(input)
  }, [key, input])

  const url = state?.output?.url
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  const current = state?.key === key ? state : null
  return {
    output: current?.output ?? null,
    error: current?.input === input ? current.error : null,
    pending: key !== null && current?.input !== input,
  }
}

const outputRenderer: Renderer<ImageRecipe> = {
  request: (engine, key, recipe) => engine.call("render", { key, recipe }),
  mime: (recipe) => FORMATS[recipe.encoding.format].mime,
}

const referenceRenderer: Renderer<Geometry> = {
  request: (engine, key, geometry) =>
    engine.call("reference", { key, geometry }),
  mime: () => "image/png",
}

/** The encoded output for `recipe`. */
export function useRender(key: string | null, recipe: ImageRecipe) {
  return useEngineOutput(key, recipe, outputRenderer)
}

/**
 * The source with only `geometry` applied, losslessly encoded, to compare
 * against the output with the same framing. Pass a null key to skip it.
 */
export function useReference(key: string | null, geometry: Geometry) {
  return useEngineOutput(key, geometry, referenceRenderer)
}
