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
import {
  applyCrop,
  FORMATS,
  framedSize,
  initialRecipe,
  isIdentityGeometry,
  isOptimizedForWeb,
  optimizeForWeb,
  type CropRect,
  type Encoding,
  type Geometry,
  type ImageRecipe,
} from "@/lib/image/recipe"
import { CompareView } from "./compare-view"
import { CropControls, CropSummary } from "./crop-settings"
import { CropView } from "./crop-view"
import { ExportSettings } from "./export-settings"
import { OutputSummary } from "./output-summary"
import { PreviewFrame } from "./preview-frame"
import { ResizeSettings } from "./resize-settings"
import { TransformSettings } from "./transform-settings"
import { useCropMode } from "./use-crop-mode"
import { useEngineImage } from "./use-engine-image"
import { useReference, useRender } from "./use-render"
import { WebPresetButton } from "./web-preset-button"

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
  // The original already matches an untransformed output, so the lossless
  // reference is only rendered once the geometry changes.
  const identity = isIdentityGeometry(recipe.geometry)
  const reference = useReference(identity ? null : key, recipe.geometry)

  const updateGeometry = (changes: Partial<Geometry>) =>
    setRecipe((current) => ({
      ...current,
      geometry: { ...current.geometry, ...changes },
    }))
  const updateEncoding = (changes: Partial<Encoding>) =>
    setRecipe((current) => ({
      ...current,
      encoding: { ...current.encoding, ...changes },
    }))

  const sourceSize = image.status === "ready" ? image.info : null
  const setCrop = (crop: CropRect | null) => {
    if (!sourceSize) return
    setRecipe((current) => ({
      ...current,
      geometry: applyCrop(current.geometry, crop, sourceSize),
    }))
  }
  const cropMode = useCropMode({
    imageKey: key,
    geometry: recipe.geometry,
    source: sourceSize ?? { width: 1, height: 1 },
    previewUrl,
    onApply: setCrop,
  })

  const shown = cropMode.active ? cropMode.size : (output ?? sourceSize)

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row md:items-start">
      <PreviewFrame
        width={shown?.width}
        height={shown?.height}
        busy={
          image.status === "loading" ||
          (cropMode.active ? cropMode.pending : pending || reference.pending)
        }
      >
        {cropMode.active ? (
          cropMode.src && (
            <CropView
              src={cropMode.src}
              alt={`${file.name}, crop area`}
              crop={cropMode.crop}
              aspect={cropMode.aspect}
              onChange={cropMode.setCrop}
            />
          )
        ) : (
          <CompareView
            before={
              identity ? previewUrl : (reference.output?.url ?? previewUrl)
            }
            after={output?.url ?? previewUrl}
            alt={file.name}
            afterLabel={
              output
                ? `After · ${FORMATS[output.input.encoding.format].label}`
                : "After"
            }
          />
        )}
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

        {image.status === "ready" && cropMode.active && (
          <CropControls
            aspect={cropMode.aspect}
            onAspectChange={cropMode.setAspect}
            onApply={cropMode.apply}
            onCancel={cropMode.cancel}
          />
        )}

        {image.status === "ready" && !cropMode.active && (
          <>
            <WebPresetButton
              active={isOptimizedForWeb(recipe)}
              onApply={() => setRecipe(optimizeForWeb)}
            />
            <TransformSettings
              geometry={recipe.geometry}
              onChange={updateGeometry}
            />
            <CropSummary
              cropped={recipe.geometry.crop !== null}
              onStart={cropMode.start}
              onClear={() => setCrop(null)}
            />
            <ResizeSettings
              geometry={recipe.geometry}
              framed={framedSize(image.info, recipe.geometry)}
              onChange={updateGeometry}
            />
            <ExportSettings
              encoding={recipe.encoding}
              info={image.info}
              onChange={updateEncoding}
            />
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
