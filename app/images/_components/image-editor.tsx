"use client"

import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Artboard } from "@/components/artboard"
import { useAsset } from "@/components/asset-provider"
import { Button } from "@/components/ui/button"
import { useCrossOriginIsolated } from "@/hooks/use-cross-origin-isolated"
import { formatBytes } from "@/lib/image/format"
import { initialRecipe, type ImageRecipe } from "@/lib/image/recipe"
import { ExportSettings } from "./export-settings"
import { OutputSummary } from "./output-summary"
import { PreviewFrame } from "./preview-frame"
import { useEngineImage } from "./use-engine-image"
import { useRender } from "./use-render"

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <Artboard className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        {children}
      </div>
    </Artboard>
  )
}

export function ImageEditor() {
  const { file, previewUrl, clearAsset } = useAsset()
  const isolated = useCrossOriginIsolated()
  const router = useRouter()

  if (!file || !previewUrl || !file.type.startsWith("image/")) {
    return (
      <Notice>
        <p className="text-sm text-muted-foreground">No image loaded yet.</p>
        <Link
          href="/"
          className="font-mono text-xs text-primary underline underline-offset-4"
        >
          Go back and import one
        </Link>
      </Notice>
    )
  }

  if (isolated === false) {
    return (
      <Notice>
        <p className="font-mono text-xs text-destructive uppercase">
          Unsupported browser
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          The image editor needs cross-origin isolation (SharedArrayBuffer),
          which this browser or page load doesn&apos;t provide. Try reloading
          the page or using a recent version of Chrome, Firefox or Safari.
        </p>
      </Notice>
    )
  }

  return (
    <Editor
      // A new file starts a fresh editing session.
      key={previewUrl}
      file={file}
      previewUrl={previewUrl}
      onReset={() => {
        clearAsset()
        router.push("/")
      }}
    />
  )
}

function Editor({
  file,
  previewUrl,
  onReset,
}: {
  file: File
  previewUrl: string
  onReset: () => void
}) {
  const image = useEngineImage(file)
  const [recipe, setRecipe] = useState<ImageRecipe>(() =>
    initialRecipe(file.type)
  )
  const key = image.status === "ready" ? image.key : null
  const { output, pending, error } = useRender(key, recipe)

  const updateRecipe = (changes: Partial<ImageRecipe>) =>
    setRecipe((current) => ({ ...current, ...changes }))

  const shown = output ?? (image.status === "ready" ? image.info : null)

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row md:items-start">
      <PreviewFrame
        width={shown?.width}
        height={shown?.height}
        busy={image.status === "loading" || pending}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={output?.url ?? previewUrl}
          alt={file.name}
          className="block size-full object-contain"
        />
      </PreviewFrame>

      <aside
        aria-label="Image settings"
        className="flex w-full shrink-0 flex-col gap-6 rounded-md border border-border bg-card p-4 md:w-64"
      >
        <div className="flex flex-col gap-1">
          <p className="font-heading text-lg font-bold break-all text-foreground">
            {file.name}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatBytes(file.size)}
            {image.status === "ready" &&
              ` · ${image.info.width} × ${image.info.height}`}
          </p>
        </div>

        {image.status === "loading" && (
          <p
            role="status"
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase"
          >
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Loading image engine…
          </p>
        )}

        {image.status === "error" && (
          <p role="alert" className="font-mono text-xs text-destructive">
            Couldn&apos;t read this image · {image.message}
          </p>
        )}

        {image.status === "ready" && (
          <>
            <ExportSettings recipe={recipe} onChange={updateRecipe} />
            <OutputSummary
              sourceName={file.name}
              sourceSize={file.size}
              output={output}
              pending={pending}
              error={error}
            />
          </>
        )}

        <Button variant="ghost" size="sm" onClick={onReset}>
          Import a different file
        </Button>
      </aside>
    </div>
  )
}
