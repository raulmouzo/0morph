import { Plus, X } from "lucide-react"

import type { Asset } from "@/components/asset-provider"
import { cn } from "@/lib/utils"

/** Thumbnails of every loaded image: pick one to preview, add or remove. */
export function AssetStrip({
  assets,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
}: {
  assets: Asset[]
  selectedId: string
  onSelect: (id: string) => void
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
}) {
  return (
    <ul
      aria-label="Images"
      className="flex gap-3 overflow-x-auto px-1 pt-2 pb-1"
    >
      {assets.map((asset) => {
        const selected = asset.id === selectedId
        return (
          <li key={asset.id} className="relative shrink-0">
            <button
              type="button"
              aria-label={`Preview ${asset.file.name}`}
              aria-pressed={selected}
              onClick={() => onSelect(asset.id)}
              className={cn(
                "block size-16 overflow-hidden rounded-md border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                selected
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.previewUrl}
                alt=""
                className="size-full object-cover"
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
          </li>
        )
      })}
      <li className="shrink-0">
        <label className="flex size-16 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors focus-within:ring-2 focus-within:ring-ring/50 hover:text-foreground">
          <input
            type="file"
            accept="image/*"
            multiple
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
          <span className="sr-only">Add images</span>
        </label>
      </li>
    </ul>
  )
}
