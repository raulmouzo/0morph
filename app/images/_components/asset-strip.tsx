import { Check, Plus, X } from "lucide-react"

import { MAX_ASSETS, type Asset } from "@/components/asset-provider"
import { Button } from "@/components/ui/button"
import { selectModeOf, type SelectMode } from "@/lib/selection"
import { cn } from "@/lib/utils"

/**
 * Thumbnails of every loaded image: pick the ones to edit (Shift/Ctrl/⌘ +
 * click for several), add or remove.
 */
export function AssetStrip({
  assets,
  skipped,
  activeId,
  editing,
  onSelect,
  onSelectAll,
  onSelectOnly,
  onAdd,
  onRemove,
}: {
  assets: Asset[]
  /** Files just left out because of the limit. */
  skipped: number
  /** The previewed image. */
  activeId: string
  /** The images the settings apply to. */
  editing: Set<string>
  onSelect: (id: string, mode: SelectMode) => void
  onSelectAll: () => void
  /** Narrows the selection to the previewed image. */
  onSelectOnly: () => void
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
}) {
  const full = assets.length >= MAX_ASSETS
  const addLabel = full
    ? `Limit of ${MAX_ASSETS} images reached`
    : "Add images (or paste with Ctrl/⌘ + V)"

  return (
    <div className="flex flex-col gap-1">
      {assets.length > 1 && (
        <div className="flex items-center gap-3 px-1 font-mono text-xs text-muted-foreground">
          <p>
            {assets.length} / {MAX_ASSETS} images ·{" "}
            <span
              className={editing.size > 1 ? "text-primary" : "text-foreground"}
            >
              editing {editing.size === assets.length ? "all" : editing.size}
            </span>
          </p>
          <span className="hidden sm:inline">
            Shift / Ctrl / ⌘ + click to select several
          </span>
          <span className="ml-auto flex gap-1">
            {editing.size < assets.length && (
              <Button variant="ghost" size="sm" onClick={onSelectAll}>
                Select all
              </Button>
            )}
            {editing.size > 1 && (
              <Button variant="ghost" size="sm" onClick={onSelectOnly}>
                Only the previewed one
              </Button>
            )}
          </span>
        </div>
      )}
      {skipped > 0 && (
        <p role="alert" className="px-1 font-mono text-xs text-destructive">
          Up to {MAX_ASSETS} images at once · {skipped}{" "}
          {skipped === 1 ? "was" : "were"} left out
        </p>
      )}
      <ul
        aria-label="Images"
        // No text selection on Shift + click.
        className="flex gap-3 overflow-x-auto px-1 pt-2 pb-1 select-none"
      >
        {assets.map((asset) => {
          const active = asset.id === activeId
          const selected = editing.has(asset.id)
          return (
            <li key={asset.id} className="relative shrink-0">
              <button
                type="button"
                aria-label={`Edit ${asset.file.name}`}
                aria-pressed={selected}
                aria-current={active || undefined}
                title="Shift + click or Ctrl/⌘ + click to select several"
                onClick={(event) => onSelect(asset.id, selectModeOf(event))}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-md border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  active
                    ? "border-primary"
                    : selected
                      ? "border-primary/50"
                      : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {/* Placeholder while a large image decodes. */}
                <span
                  aria-hidden
                  className="absolute inset-0 animate-pulse bg-muted"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.previewUrl}
                  alt=""
                  className="relative size-full object-cover"
                />
              </button>
              <button
                type="button"
                aria-label={`Remove ${asset.file.name}`}
                onClick={() => onRemove(asset.id)}
                className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <X className="size-3" aria-hidden />
              </button>
              {selected && editing.size > 1 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-1 left-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </li>
          )
        })}
        <li className="shrink-0">
          <label
            title={addLabel}
            className={cn(
              "flex size-16 items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors focus-within:ring-2 focus-within:ring-ring/50",
              full
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:text-foreground"
            )}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={full}
              className="sr-only"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []).filter(
                  (file) => file.type.startsWith("image/")
                )
                if (files.length > 0) onAdd(files)
                event.target.value = ""
              }}
            />
            <Plus className="size-5" aria-hidden />
            <span className="sr-only">{addLabel}</span>
          </label>
        </li>
      </ul>
    </div>
  )
}
