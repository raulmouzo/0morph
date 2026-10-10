import { Check, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FORMATS, WEB_PRESET } from "@/lib/image/recipe"

const SUMMARY = `${FORMATS[WEB_PRESET.format].label} ${WEB_PRESET.quality} · max ${WEB_PRESET.maxDimension}px · no metadata`

/** One-click preset for web delivery; shows when it's already applied. */
export function WebPresetButton({
  active,
  onApply,
}: {
  active: boolean
  onApply: () => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={active ? "secondary" : "default"}
        size="lg"
        className="w-full"
        disabled={active}
        onClick={onApply}
      >
        {active ? <Check aria-hidden /> : <Zap aria-hidden />}
        {active ? "Optimized for web" : "Optimize for web"}
      </Button>
      <p className="text-center font-mono text-[0.65rem] text-muted-foreground">
        {SUMMARY}
      </p>
    </div>
  )
}
