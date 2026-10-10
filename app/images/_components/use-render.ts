import { useEffect, useRef, useState } from "react"

import { getImageEngine } from "@/lib/image/engine-client"
import { createLatestRunner } from "@/lib/image/latest-runner"
import { FORMATS, type ImageRecipe } from "@/lib/image/recipe"

export type RenderedImage = {
  url: string
  size: number
  width: number
  height: number
  /** The recipe that produced this output. */
  recipe: ImageRecipe
}

type RenderState = {
  key: string
  recipe: ImageRecipe
  output: RenderedImage | null
  error: string | null
}

/**
 * Renders the image opened under `key` with `recipe` whenever either
 * changes. While a render runs, only the latest recipe is queued, so fast
 * edits never pile up work in the engine.
 */
export function useRender(key: string | null, recipe: ImageRecipe) {
  const [state, setState] = useState<RenderState | null>(null)
  const runnerRef = useRef<{ request: (recipe: ImageRecipe) => void }>(null)

  useEffect(() => {
    if (!key) return
    const engine = getImageEngine()
    const runner = createLatestRunner(
      (next: ImageRecipe) => engine.call("render", { key, recipe: next }),
      (next, result) => {
        if (result.ok) {
          const { data, width, height } = result.value
          const blob = new Blob([data], { type: FORMATS[next.format].mime })
          const url = URL.createObjectURL(blob)
          const output = { url, size: data.byteLength, width, height }
          setState({
            key,
            recipe: next,
            output: { ...output, recipe: next },
            error: null,
          })
        } else {
          const error =
            result.error instanceof Error
              ? result.error.message
              : String(result.error)
          setState((previous) => ({
            key,
            recipe: next,
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
  }, [key])

  useEffect(() => {
    runnerRef.current?.request(recipe)
  }, [key, recipe])

  const url = state?.output?.url
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  const current = state?.key === key ? state : null
  return {
    output: current?.output ?? null,
    error: current?.recipe === recipe ? current.error : null,
    pending: key !== null && current?.recipe !== recipe,
  }
}
