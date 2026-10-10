import { Link2, Link2Off } from "lucide-react"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { NumberInput } from "@/components/ui/number-input"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control"
import {
  MAX_DIMENSIONS,
  MAX_RESIZE,
  type Geometry,
  type Size,
} from "@/lib/image/recipe"
import { SettingsSection } from "./settings-section"

const NO_LIMIT = "none"

export function ResizeSettings({
  geometry,
  oriented,
  onChange,
}: {
  geometry: Geometry
  /** Image size before resizing (after rotation). */
  oriented: Size
  onChange: (changes: Partial<Geometry>) => void
}) {
  const { resize } = geometry
  const maxSideLabelId = useId()
  const [lockPreference, setLockPreference] = useState(true)
  const lock = resize ? resize.keepAspect : lockPreference
  const ratio = oriented.width / oriented.height

  // The inputs show a draft while typing; it resets whenever the committed
  // size changes from outside (rotation, reset, a new crop).
  const committed = resize ?? oriented
  const [draft, setDraft] = useState<Size>(committed)
  const [basis, setBasis] = useState<Size>(committed)
  if (basis.width !== committed.width || basis.height !== committed.height) {
    setBasis(committed)
    setDraft(committed)
  }

  const withWidth = (width: number): Size =>
    lock
      ? { width, height: Math.max(1, Math.round(width / ratio)) }
      : { width, height: draft.height }
  const withHeight = (height: number): Size =>
    lock
      ? { width: Math.max(1, Math.round(height * ratio)), height }
      : { width: draft.width, height }

  const commit = (size: Size) => {
    setDraft(size)
    const unchanged =
      size.width === oriented.width && size.height === oriented.height
    onChange({ resize: unchanged ? null : { ...size, keepAspect: lock } })
  }

  const toggleLock = () => {
    const next = !lock
    setLockPreference(next)
    if (!resize) return
    onChange({
      resize: next
        ? {
            width: resize.width,
            height: Math.max(1, Math.round(resize.width / ratio)),
            keepAspect: true,
          }
        : { ...resize, keepAspect: false },
    })
  }

  return (
    <SettingsSection title="Resize">
      <div className="flex items-end gap-2">
        <NumberInput
          label="Width"
          min={1}
          max={MAX_RESIZE}
          value={draft.width}
          onValueChange={(value) =>
            value !== null && setDraft(withWidth(value))
          }
          onValueCommitted={(value) =>
            value !== null && commit(withWidth(value))
          }
        />
        <Button
          variant={lock ? "secondary" : "outline"}
          size="icon"
          aria-label="Keep aspect ratio"
          aria-pressed={lock}
          onClick={toggleLock}
        >
          {lock ? <Link2 aria-hidden /> : <Link2Off aria-hidden />}
        </Button>
        <NumberInput
          label="Height"
          min={1}
          max={MAX_RESIZE}
          value={draft.height}
          onValueChange={(value) =>
            value !== null && setDraft(withHeight(value))
          }
          onValueCommitted={(value) =>
            value !== null && commit(withHeight(value))
          }
        />
      </div>
      {resize && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => onChange({ resize: null })}
        >
          Reset to {oriented.width} × {oriented.height}
        </Button>
      )}

      <div className="flex flex-col gap-1">
        <span
          id={maxSideLabelId}
          className="font-mono text-xs text-muted-foreground uppercase"
        >
          Max side
        </span>
        <SegmentedControl<string>
          aria-labelledby={maxSideLabelId}
          value={geometry.maxDimension?.toString() ?? NO_LIMIT}
          onValueChange={(value) =>
            onChange({
              maxDimension: value === NO_LIMIT ? null : Number(value),
            })
          }
        >
          <SegmentedControlItem value={NO_LIMIT}>Off</SegmentedControlItem>
          {MAX_DIMENSIONS.map((size) => (
            <SegmentedControlItem key={size} value={size.toString()}>
              {size}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
    </SettingsSection>
  )
}
