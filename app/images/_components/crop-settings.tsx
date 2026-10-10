import { Crop } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control"
import { CROP_ASPECTS } from "@/lib/image/recipe"
import { SettingsSection } from "./settings-section"

/** Entry point to crop mode, shown with the other settings. */
export function CropSummary({
  cropped,
  onStart,
  onClear,
}: {
  cropped: boolean
  onStart: () => void
  onClear: () => void
}) {
  return (
    <SettingsSection title="Crop">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="lg" onClick={onStart}>
          <Crop aria-hidden />
          {cropped ? "Edit crop" : "Crop"}
        </Button>
        {cropped && (
          <Button variant="ghost" size="lg" onClick={onClear}>
            Remove crop
          </Button>
        )}
      </div>
    </SettingsSection>
  )
}

/** Controls shown instead of the other settings while cropping. */
export function CropControls({
  aspect,
  onAspectChange,
  onApply,
  onCancel,
}: {
  aspect: number | null
  onAspectChange: (aspect: number | null) => void
  onApply: () => void
  onCancel: () => void
}) {
  const selected =
    CROP_ASPECTS.find((option) => option.value === aspect)?.label ?? "Free"

  return (
    <SettingsSection title="Crop">
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
        Drag the box or its handles. Arrow keys nudge it once it&apos;s focused.
      </p>
      <div className="flex gap-2">
        <Button size="lg" className="flex-1" onClick={onApply}>
          Apply crop
        </Button>
        <Button variant="ghost" size="lg" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </SettingsSection>
  )
}
