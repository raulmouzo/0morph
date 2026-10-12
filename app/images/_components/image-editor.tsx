"use client"

import {
  ArrowLeft,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useMemo, useState } from "react"

import { Artboard } from "@/components/artboard"
import { useAsset, type Asset } from "@/components/asset-provider"
import { Button } from "@/components/ui/button"
import { useCrossOriginIsolated } from "@/hooks/use-cross-origin-isolated"
import { useFullscreen } from "@/hooks/use-fullscreen"
import { usePasteImages } from "@/hooks/use-paste-images"
import type { BatchJob } from "@/lib/image/batch"
import { formatBytes, sourceFormatLabel } from "@/lib/image/format"
import {
  applyCrop,
  FORMATS,
  initialRecipe,
  isIdentityGeometry,
  isOptimizedForWeb,
  optimizeForWeb,
  sameGeometry,
  type CropRect,
  type Encoding,
  type Geometry,
  type ImageRecipe,
} from "@/lib/image/recipe"
import {
  pruneSelection,
  select,
  selectOne,
  type SelectMode,
} from "@/lib/selection"
import { cn } from "@/lib/utils"
import { AssetStrip } from "./asset-strip"
import { BatchExport } from "./batch-export"
import { CropView } from "./crop-view"
import { OutputSummary } from "./output-summary"
import { CanvasImage, ImageCanvas, type CanvasOverlays } from "./image-canvas"
import { ImageStats } from "./image-stats"
import { SettingsAccordion, type SectionId } from "./settings-accordion"
import { useCropMode } from "./use-crop-mode"
import { useEngineImage } from "./use-engine-image"
import { useReference, useRender } from "./use-render"
import { WebPresetButton } from "./web-preset-button"

// Below Tailwind's `md`, where the editor's columns stack.
const PHONE_QUERY = "(max-width: 47.99rem)"

// Recipes are compared by identity to know when to render again, so an
// image without edits must get the same default recipe on every render.
const defaultRecipes = new Map<string, ImageRecipe>()
function defaultRecipe(mime: string) {
  let recipe = defaultRecipes.get(mime)
  if (!recipe) {
    recipe = initialRecipe(mime)
    defaultRecipes.set(mime, recipe)
  }
  return recipe
}

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
  const {
    assets,
    sessionId,
    skipped,
    replaceAssets,
    addAssets,
    removeAsset,
    clearAssets,
  } = useAsset()
  const isolated = useCrossOriginIsolated()
  const router = useRouter()
  // Stable while the assets don't change, like the batch jobs built on it.
  const images = useMemo(
    () => assets.filter((asset) => asset.file.type.startsWith("image/")),
    [assets]
  )

  // Ctrl/⌘+V adds the copied image to the batch, or starts one.
  usePasteImages((files) =>
    images.length > 0 ? addAssets(files) : replaceAssets(files)
  )

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
      skipped={skipped}
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
  skipped,
  onAdd,
  onRemove,
  onReset,
}: {
  assets: Asset[]
  skipped: number
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  onReset: () => void
}) {
  const order = assets.map((asset) => asset.id)
  // The images being edited; the active one is previewed. Removed images
  // drop out of it.
  const [rawSelection, setSelection] = useState(() => selectOne(order[0]))
  const selection = pruneSelection(order, rawSelection)
  const editing = new Set(selection.ids)
  const onSelect = (id: string, mode: SelectMode) =>
    setSelection(select(order, selection, id, mode))
  const selected =
    assets.find((asset) => asset.id === selection.active) ?? assets[0]
  const { file, previewUrl } = selected

  const image = useEngineImage(file)
  // Each image has its own recipe, starting from its own format.
  const [recipes, setRecipes] = useState<Record<string, ImageRecipe>>({})
  const recipeOf = (asset: Asset) =>
    recipes[asset.id] ?? defaultRecipe(asset.file.type)
  const recipe = recipeOf(selected)
  // An edit is applied to every selected image's own recipe, so it only
  // changes what was edited (e.g. the quality, not each image's format).
  const setRecipe = (update: (current: ImageRecipe) => ImageRecipe) =>
    setRecipes((current) => {
      const next = { ...current }
      for (const asset of assets) {
        if (!editing.has(asset.id)) continue
        next[asset.id] = update(
          current[asset.id] ?? defaultRecipe(asset.file.type)
        )
      }
      return next
    })
  const jobs = useMemo<BatchJob[]>(
    () =>
      assets.map((asset) => ({
        file: asset.file,
        recipe: recipes[asset.id] ?? defaultRecipe(asset.file.type),
      })),
    [assets, recipes]
  )
  const uniform = jobs.every(
    (job) => JSON.stringify(job.recipe) === JSON.stringify(jobs[0].recipe)
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

  // The before/after pair on screen must share one geometry, or one side is
  // stretched into the other's frame. Both follow the last output: before
  // is the original or the reference for that geometry, and while that
  // reference isn't ready the output stands in for it. Until the output
  // catches up with an edit to the geometry, that stale pair is blurred.
  const frameGeometry = output?.input.geometry ?? null
  const beforeReady =
    !frameGeometry ||
    isIdentityGeometry(frameGeometry) ||
    (reference.output !== null &&
      sameGeometry(reference.output.input, frameGeometry))
  const beforeSrc =
    !output || isIdentityGeometry(output.input.geometry)
      ? previewUrl
      : beforeReady
        ? reference.output!.url
        : output.url
  const settling =
    frameGeometry !== null &&
    (!sameGeometry(frameGeometry, recipe.geometry) || !beforeReady)

  const shown = cropMode.active ? cropMode.size : (output ?? sourceSize)
  const batch = assets.length > 1
  const multiple = selection.ids.length > 1

  // Phones open straight into full screen: stacked under the settings, the
  // canvas is too small to work with. The editor only renders on the client
  // (the images live in browser state), so the media query can be read here.
  const fullscreen = useFullscreen({
    initial: () => window.matchMedia(PHONE_QUERY).matches,
  })
  // Full screen hides the settings in a drawer on the right.
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsId = useId()

  const busy =
    image.status === "loading" ||
    (cropMode.active ? cropMode.pending : pending || reference.pending)

  // The canvas HUD: navigation along the top, and the two sides of the
  // comparison in the bottom corners (the zoom bar sits between them).
  const overlays: CanvasOverlays = {
    topLeft: (
      <Button
        variant="outline"
        size="lg"
        className="bg-background/85 backdrop-blur-sm"
        onClick={() => {
          fullscreen.exit()
          onReset()
        }}
      >
        <ArrowLeft aria-hidden />
        Back
      </Button>
    ),
    topCenter: busy && (
      <span
        role="status"
        className="flex items-center gap-1.5 rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground uppercase backdrop-blur-sm"
      >
        <Loader2 className="size-3 animate-spin" aria-hidden />
        Rendering
      </span>
    ),
    topRight: fullscreen.active && !settingsOpen && (
      <Button
        variant="outline"
        size="lg"
        className="bg-background/85 backdrop-blur-sm"
        aria-controls={settingsId}
        aria-expanded={false}
        onClick={() => setSettingsOpen(true)}
      >
        <PanelRightOpen aria-hidden />
        Settings
      </Button>
    ),
    bottomLeft: !cropMode.active && sourceSize && (
      <ImageStats
        label="Before"
        format={sourceFormatLabel(file)}
        size={file.size}
        width={sourceSize.width}
        height={sourceSize.height}
      />
    ),
    bottomRight: !cropMode.active && output && (
      <ImageStats
        label="After"
        align="end"
        format={FORMATS[output.input.encoding.format].label}
        size={output.size}
        width={output.width}
        height={output.height}
        originalSize={file.size}
      />
    ),
  }

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
          className={
            fullscreen.active
              ? "min-h-0 flex-1"
              : "h-[42svh] md:h-[calc(100svh-11rem)]"
          }
        >
          <ImageCanvas
            imageSize={shown}
            resetKey={`${selected.id}|${cropMode.active ? "crop" : "compare"}`}
            panFromContent={!cropMode.active}
            fullscreen={fullscreen.active}
            onToggleFullscreen={fullscreen.toggle}
            overlays={overlays}
            before={
              !cropMode.active && (
                <CanvasImage
                  src={beforeSrc}
                  alt={`${file.name}, before`}
                  settling={settling}
                />
              )
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
              <CanvasImage
                src={output?.url ?? previewUrl}
                alt={`${file.name}, after`}
                settling={settling}
              />
            )}
          </ImageCanvas>
        </div>
        {!cropMode.active && (
          <AssetStrip
            assets={assets}
            skipped={skipped}
            activeId={selected.id}
            editing={editing}
            onSelect={onSelect}
            onSelectAll={() =>
              setSelection({
                ids: order,
                anchor: selected.id,
                active: selected.id,
              })
            }
            onSelectOnly={() => setSelection(selectOne(selected.id))}
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
          {multiple && (
            <p className="font-mono text-[0.65rem] text-primary uppercase">
              Changes apply to {selection.ids.length} of {assets.length} images
            </p>
          )}
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
                batch: multiple,
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
                {batch && <BatchExport jobs={jobs} shared={uniform} />}
              </OutputSummary>
            )}
          </>
        )}
      </aside>
    </div>
  )
}
