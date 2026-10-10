import type { ImageEngine } from "./engine-client"
import { outputFileName } from "./format"
import type { ImageRecipe } from "./recipe"

export type BatchResult =
  | {
      ok: true
      file: File
      name: string
      data: ArrayBuffer
      width: number
      height: number
    }
  | { ok: false; file: File; name: string; error: string }

/**
 * Makes every name unique by appending " (2)", " (3)"… before the extension,
 * like a file manager would.
 */
export function uniqueNames(names: string[]) {
  const used = new Set<string>()
  return names.map((name) => {
    let candidate = name
    const dot = name.lastIndexOf(".")
    const base = dot > 0 ? name.slice(0, dot) : name
    const extension = dot > 0 ? name.slice(dot) : ""
    for (let n = 2; used.has(candidate.toLowerCase()); n++) {
      candidate = `${base} (${n})${extension}`
    }
    used.add(candidate.toLowerCase())
    return candidate
  })
}

/** One image of a batch and the edits to render it with. */
export type BatchJob = { file: File; recipe: ImageRecipe }

/**
 * Renders every file with its own recipe, one after another, so only one
 * image is decoded in the engine at a time. Failures are reported per file
 * instead of stopping the batch.
 */
export async function renderBatch(
  engine: ImageEngine,
  jobs: BatchJob[],
  {
    signal,
    onProgress,
  }: { signal?: AbortSignal; onProgress?: (done: number) => void } = {}
): Promise<BatchResult[]> {
  const names = uniqueNames(
    jobs.map(({ file, recipe }) =>
      outputFileName(file.name, recipe.encoding.format)
    )
  )
  const results: BatchResult[] = []

  for (const [index, { file, recipe }] of jobs.entries()) {
    signal?.throwIfAborted()
    const name = names[index]
    const key = crypto.randomUUID()
    try {
      const data = await file.arrayBuffer()
      await engine.call("open", { key, data }, [data])
      const output = await engine.call("render", { key, recipe })
      results.push({ ok: true, file, name, ...output })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      results.push({ ok: false, file, name, error: message })
    } finally {
      await engine.call("close", { key }).catch(() => {})
    }
    onProgress?.(index + 1)
  }

  return results
}
