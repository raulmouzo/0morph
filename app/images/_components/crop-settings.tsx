import { Button } from "@/components/ui/button"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control"
import { CROP_ASPECTS } from "@/lib/image/recipe"

/** Crop section: shown while crop mode is active over the preview. */
export function CropSettings({
  aspect,
  batch,
  cropped,
  onAspectChange,
  onApply,
  onCancel,
  onRemove,
}: {
  aspect: number | null
  /** Whether the crop applies to several images. */
  batch: boolean
  /** Whether a crop is currently applied. */
  cropped: boolean
  onAspectChange: (aspect: number | null) => void
  onApply: () => void
  onCancel: () => void
  onRemove: () => void
}) {
  const selected =
    CROP_ASPECTS.find((option) => option.value === aspect)?.label ?? "Free"

  return (
    <>
      <SegmentedControl<string>
        aria-label="Aspect ratio"
        className="grid-flow-row grid-cols-4"
        value={selected}
        onValueChange={(label) =>
          onAspectChange(
            CROP_ASPECTS.find((option) => option.label === label)?.value ?? null
          )
        }
      >
        {CROP_ASPECTS.map((option) => (
          <SegmentedControlItem key={option.label} value={option.label}>
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <p className="text-xs text-muted-foreground">
        Drag the box or its handles on the image.
        {batch &&
          " Every image is cropped at the same area, in percent of its size."}
      </p>
      <div className="flex gap-2">
        <Button size="lg" className="flex-1" onClick={onApply}>
          Apply crop
        </Button>
        <Button variant="ghost" size="lg" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      {cropped && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={onRemove}
        >
          Remove crop
        </Button>
      )}
    </>
  )
}
