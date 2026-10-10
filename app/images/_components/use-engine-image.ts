import { useEffect, useState } from "react"

import { getImageEngine } from "@/lib/image/engine-client"
import type { ImageInfo } from "@/lib/image/pipeline"

export type EngineImage =
  | { status: "loading" }
  | { status: "ready"; key: string; info: ImageInfo }
  | { status: "error"; message: string }

const LOADING: EngineImage = { status: "loading" }

/**
 * Opens `file` in the image engine and releases it when the file changes or
 * the component unmounts.
 */
export function useEngineImage(file: File): EngineImage {
  const [state, setState] = useState<{ file: File; image: EngineImage }>()

  useEffect(() => {
    const engine = getImageEngine()
    const key = crypto.randomUUID()
    let active = true

    const opened = file
      .arrayBuffer()
      .then((data) => engine.call("open", { key, data }, [data]))
      .then((info) => {
        if (active) setState({ file, image: { status: "ready", key, info } })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        if (active) setState({ file, image: { status: "error", message } })
      })

    return () => {
      active = false
      // Wait for `open` so the image is released even if it was still loading.
      void opened.finally(() => engine.call("close", { key }).catch(() => {}))
    }
  }, [file])

  return state?.file === file ? state.image : LOADING
}
