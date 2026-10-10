"use client"

import {
  ArrowLeft,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useState } from "react"

import { Artboard } from "@/components/artboard"
import { useAsset, type Asset } from "@/components/asset-provider"
import { Button } from "@/components/ui/button"
import { useCrossOriginIsolated } from "@/hooks/use-cross-origin-isolated"
import { useFullscreen } from "@/hooks/use-fullscreen"
import { formatBytes, sourceFormatLabel } from "@/lib/image/format"
import {
  applyCrop,
  FORMATS,
  initialRecipe,
  isIdentityGeometry,
  isOptimizedForWeb,
  optimizeForWeb,
  type CropRect,
  type Encoding,
  type Geometry,
  type ImageRecipe,
} from "@/lib/image/recipe"
import { cn } from "@/lib/utils"
import { AssetStrip } from "./asset-strip"
import { BatchExport } from "./batch-export"
import { CompareView } from "./compare-view"
import { CropView } from "./crop-view"
import { OutputSummary } from "./output-summary"
import { ImageCanvas } from "./image-canvas"
import { SettingsAccordion, type SectionId } from "./settings-accordion"
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
  const { assets, sessionId, addAssets, removeAsset, clearAssets } = useAsset()
  const isolated = useCrossOriginIsolated()
  const router = useRouter()
  const images = assets.filter((asset) => asset.file.type.startsWith("image/"))

  if (images.length === 0) {
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
      // A new import starts a fresh editing session; adding images doesn't.
      key={sessionId}
      assets={images}
      onAdd={addAssets}
      onRemove={removeAsset}
      onReset={() => {
        clearAssets()
        router.push("/")
      }}
    />
  )
}

function Editor({
  assets,
  onAdd,
  onRemove,
  onReset,
}: {
  assets: Asset[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  onReset: () => void
}) {
  const [selectedId, setSelectedId] = useState(assets[0].id)
  // Falls back to the first image when the selected one is removed.
  const selected = assets.find((asset) => asset.id === selectedId) ?? assets[0]
  const { file, previewUrl } = selected

  const image = useEngineImage(file)
  // One recipe for every image; it starts from the first image's format.
  const [recipe, setRecipe] = useState<ImageRecipe>(() =>
    initialRecipe(assets[0].file.type)
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

  // Crop mode is tied to the Crop section: opening it starts cropping and
  // leaving it (for another section, or closing it) discards the draft.
  const [openSection, setOpenSection] = useState<SectionId | null>("export")
  const changeSection = (next: SectionId | null) => {
    if (openSection === "crop" && next !== "crop") cropMode.cancel()
    if (next === "crop" && openSection !== "crop") cropMode.start()
    setOpenSection(next)
  }

  const shown = cropMode.active ? cropMode.size : (output ?? sourceSize)
  const batch = assets.length > 1

  const fullscreen = useFullscreen()
  // Full screen hides the settings in a drawer on the right.
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsId = useId()

  return (
    <div
      className={cn(
        fullscreen.active
          ? "fixed inset-0 z-50 flex overflow-hidden bg-background p-3"
          : "flex w-full flex-col gap-4 md:flex-row md:items-start md:gap-6"
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-3",
          fullscreen.active
            ? "min-h-0"
            : // Sticky so the image stays in view while the settings are
              // used; on phones it sits above the scrolling panel.
              "sticky top-0 z-10 bg-background py-2 md:top-4 md:py-0"
        )}
      >
        {/* Same size whatever the image: the image moves and zooms inside. */}
        <div
          className={cn(
            "relative",
            fullscreen.active
              ? "min-h-0 flex-1"
              : "h-[42svh] md:h-[calc(100svh-11rem)]"
          )}
        >
          <ImageCanvas
            content={shown}
            resetKey={`${selected.id}|${cropMode.active ? "crop" : "compare"}`}
            panFromContent={!cropMode.active}
            fullscreen={fullscreen.active}
            onToggleFullscreen={fullscreen.toggle}
            busy={
              image.status === "loading" ||
              (cropMode.active
                ? cropMode.pending
                : pending || reference.pending)
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
                beforeLabel={`${sourceFormatLabel(file)} · ${formatBytes(file.size)}`}
                afterLabel={
                  output
                    ? `${FORMATS[output.input.encoding.format].label} · ${formatBytes(output.size)}`
                    : undefined
                }
              />
            )}
          </ImageCanvas>

          <Button
            variant="outline"
            size="lg"
            className="absolute top-3 left-3 z-30 bg-background/85 backdrop-blur-sm"
            onClick={() => {
              fullscreen.exit()
              onReset()
            }}
          >
            <ArrowLeft aria-hidden />
            Back
          </Button>
          {fullscreen.active && !settingsOpen && (
            <Button
              variant="outline"
              size="lg"
              className="absolute top-3 right-3 z-30 bg-background/85 backdrop-blur-sm"
              aria-controls={settingsId}
              aria-expanded={false}
              onClick={() => setSettingsOpen(true)}
            >
              <PanelRightOpen aria-hidden />
              Settings
            </Button>
          )}
        </div>
        {!cropMode.active && (
          <AssetStrip
            assets={assets}
            selectedId={selected.id}
            onSelect={setSelectedId}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        )}
      </div>

      <aside
        id={settingsId}
        aria-label="Image settings"
        // In full screen the panel is a drawer; while hidden it must not be
        // reachable with the keyboard.
        inert={fullscreen.active && !settingsOpen}
        className={cn(
          "flex shrink-0 flex-col gap-3 rounded-md border border-border bg-card p-4",
          fullscreen.active
            ? cn(
                "absolute top-3 right-3 bottom-3 z-40 w-68 overflow-y-auto shadow-xl transition-transform duration-200",
                settingsOpen
                  ? "translate-x-0"
                  : "translate-x-[calc(100%+1.5rem)]"
              )
            : "w-full md:sticky md:top-4 md:max-h-[calc(100svh-4.5rem)] md:w-68 md:overflow-y-auto"
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {/* Secondary info: one short line, full name on hover. */}
            <p
              className="min-w-0 flex-1 truncate font-mono text-xs text-foreground"
              title={file.name}
            >
              {file.name}
            </p>
            {fullscreen.active && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Hide settings"
                aria-controls={settingsId}
                aria-expanded
                onClick={() => setSettingsOpen(false)}
              >
                <PanelRightClose aria-hidden />
              </Button>
            )}
          </div>
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
            <WebPresetButton
              active={isOptimizedForWeb(recipe)}
              onApply={() => setRecipe(optimizeForWeb)}
            />
            <SettingsAccordion
              open={openSection}
              onOpenChange={changeSection}
              recipe={recipe}
              info={image.info}
              crop={{
                aspect: cropMode.aspect,
                batch,
                onAspectChange: cropMode.setAspect,
                onApply: () => {
                  cropMode.apply()
                  setOpenSection(null)
                },
                onCancel: () => changeSection(null),
                onRemove: () => {
                  setCrop(null)
                  changeSection(null)
                },
              }}
              onGeometryChange={updateGeometry}
              onEncodingChange={updateEncoding}
            />
            {/* The result describes the applied edits, not a crop draft. */}
            {!cropMode.active && (
              <OutputSummary
                sourceName={file.name}
                sourceSize={file.size}
                output={output}
                pending={pending}
                error={error}
                downloadLabel={batch ? "Download this image" : "Download"}
              >
                {batch && <BatchExport assets={assets} recipe={recipe} />}
              </OutputSummary>
            )}
          </>
        )}
      </aside>
    </div>
  )
}
