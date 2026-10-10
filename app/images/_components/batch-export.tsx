import { downloadZip } from "client-zip"
import { FolderDown, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { Asset } from "@/components/asset-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { renderBatch } from "@/lib/image/batch"
import { getImageEngine } from "@/lib/image/engine-client"
import { formatBytes, formatSizeChange } from "@/lib/image/format"
import type { ImageRecipe } from "@/lib/image/recipe"
import { cn } from "@/lib/utils"
import { SettingsSection } from "./settings-section"

const ZIP_NAME = "0morph-images.zip"

type ExportState =
  | { status: "idle" }
  | { status: "running"; done: number }
  | {
      status: "done"
      assets: Asset[]
      recipe: ImageRecipe
      url: string
      zipSize: number
      originalSize: number
      outputSize: number
      failed: string[]
    }
  | { status: "error"; message: string }

function saveFile(url: string, name: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
}

/** Renders every image with the shared recipe and downloads them as a ZIP. */
export function BatchExport({
  assets,
  recipe,
}: {
  assets: Asset[]
  recipe: ImageRecipe
}) {
  const [state, setState] = useState<ExportState>({ status: "idle" })
  const abortRef = useRef<AbortController>(null)

  // Stop the batch if the editor goes away mid-way.
  useEffect(() => () => abortRef.current?.abort(), [])

  const url = state.status === "done" ? state.url : null
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  async function run() {
    const controller = new AbortController()
    abortRef.current = controller
    setState({ status: "running", done: 0 })
    try {
      const results = await renderBatch(
        getImageEngine(),
        assets.map((asset) => asset.file),
        recipe,
        {
          signal: controller.signal,
          onProgress: (done) => setState({ status: "running", done }),
        }
      )
      const rendered = results.filter((result) => result.ok)
      const zip = await downloadZip(
        rendered.map(({ name, data }) => ({ name, input: data }))
      ).blob()
      const zipUrl = URL.createObjectURL(zip)
      setState({
        status: "done",
        assets,
        recipe,
        url: zipUrl,
        zipSize: zip.size,
        originalSize: rendered.reduce((sum, r) => sum + r.file.size, 0),
        outputSize: rendered.reduce((sum, r) => sum + r.data.byteLength, 0),
        failed: results.filter((r) => !r.ok).map((r) => r.file.name),
      })
      if (rendered.length > 0) saveFile(zipUrl, ZIP_NAME)
    } catch (error) {
      if (controller.signal.aborted) {
        setState({ status: "idle" })
      } else {
        const message = error instanceof Error ? error.message : String(error)
        setState({ status: "error", message })
      }
    }
  }

  // A finished export only describes the images and settings it used.
  const current =
    state.status === "done" &&
    state.assets === assets &&
    state.recipe === recipe
      ? state
      : null

  return (
    <SettingsSection title={`All images · ${assets.length}`}>
      <p className="text-xs text-muted-foreground">
        The same edits apply to every image. A crop covers the same area, in
        percent, of each one.
      </p>

      {state.status === "running" ? (
        <div className="flex flex-col gap-2">
          <div
            role="progressbar"
            aria-label="Exporting images"
            aria-valuemin={0}
            aria-valuemax={assets.length}
            aria-valuenow={state.done}
            className="h-1 w-full overflow-hidden rounded-full bg-foreground/15"
          >
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${(state.done / assets.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              {state.done} / {assets.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => abortRef.current?.abort()}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="lg" className="w-full" onClick={run}>
          <FolderDown aria-hidden />
          Download all as ZIP
        </Button>
      )}

      {current && (
        <div
          className="flex flex-col gap-2 font-mono text-xs"
          aria-live="polite"
        >
          <p className="text-muted-foreground">
            {formatBytes(current.originalSize)} →{" "}
            <span className="text-foreground">
              {formatBytes(current.outputSize)}
            </span>{" "}
            <span
              className={
                current.outputSize <= current.originalSize
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              }
            >
              ({formatSizeChange(current.originalSize, current.outputSize)})
            </span>
          </p>
          {current.failed.length > 0 && (
            <p role="alert" className="text-destructive">
              Couldn&apos;t process: {current.failed.join(", ")}
            </p>
          )}
          <a
            href={current.url}
            download={ZIP_NAME}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "self-start px-0"
            )}
          >
            Save the ZIP again ({formatBytes(current.zipSize)})
          </a>
        </div>
      )}

      {state.status === "error" && (
        <p role="alert" className="font-mono text-xs text-destructive">
          Export failed · {state.message}
        </p>
      )}
    </SettingsSection>
  )
}
