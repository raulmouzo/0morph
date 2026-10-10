import { useState } from "react"

import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control"
import { Slider } from "@/components/ui/slider"
import {
  FORMATS,
  OUTPUT_FORMATS,
  type Encoding,
  type OutputFormat,
} from "@/lib/image/recipe"
import { SettingsSection } from "./settings-section"

export function ExportSettings({
  encoding,
  onChange,
}: {
  encoding: Encoding
  onChange: (changes: Partial<Encoding>) => void
}) {
  const lossy = FORMATS[encoding.format].lossy

  return (
    <SettingsSection title="Export">
      <SegmentedControl<OutputFormat>
        aria-label="Output format"
        value={encoding.format}
        onValueChange={(format) => onChange({ format })}
      >
        {OUTPUT_FORMATS.map((format) => (
          <SegmentedControlItem key={format} value={format}>
            {FORMATS[format].label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      <QualitySlider
        quality={encoding.quality}
        disabled={!lossy}
        onCommit={(quality) => onChange({ quality })}
      />
      {!lossy && (
        <p className="text-xs text-muted-foreground">
          {FORMATS[encoding.format].label} is lossless, quality doesn&apos;t
          apply.
        </p>
      )}
    </SettingsSection>
  )
}

/**
 * Shows the value live while dragging but only commits it on release, so
 * slow encoders (AVIF) aren't asked to render every intermediate step.
 */
function QualitySlider({
  quality,
  disabled,
  onCommit,
}: {
  quality: number
  disabled: boolean
  onCommit: (quality: number) => void
}) {
  const [draft, setDraft] = useState(quality)
  const [committed, setCommitted] = useState(quality)

  // Follow external changes (e.g. a preset) without an effect.
  if (committed !== quality) {
    setCommitted(quality)
    setDraft(quality)
  }

  return (
    <Slider
      label="Quality"
      min={1}
      max={100}
      value={draft}
      disabled={disabled}
      onValueChange={setDraft}
      onValueCommitted={onCommit}
    />
  )
}
