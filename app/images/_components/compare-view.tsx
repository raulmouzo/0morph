import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider"

import { cn } from "@/lib/utils"

function Label({
  side,
  title,
  detail,
}: {
  side: "left" | "right"
  title: string
  /** Format and size; hidden when the image is too narrow for both labels. */
  detail?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-3 z-10 rounded-sm bg-background/80 px-2 py-1 font-mono text-[0.65rem] text-foreground uppercase backdrop-blur-sm",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      {title}
      {detail && <span className="hidden @md:inline"> · {detail}</span>}
    </span>
  )
}

/**
 * Before/after split between the original and the output. Only the handle
 * moves the divider, so dragging the image pans the canvas instead.
 */
export function CompareView({
  before,
  after,
  alt,
  beforeLabel,
  afterLabel,
}: {
  before: string
  after: string
  alt: string
  beforeLabel: string
  afterLabel?: string
}) {
  return (
    <div className="@container relative size-full">
      <ReactCompareSlider
        className="size-full"
        onlyHandleDraggable
        itemOne={
          <ReactCompareSliderImage src={before} alt={`${alt}, before`} />
        }
        itemTwo={<ReactCompareSliderImage src={after} alt={`${alt}, after`} />}
      />
      <Label side="left" title="Before" detail={beforeLabel} />
      <Label side="right" title="After" detail={afterLabel} />
    </div>
  )
}
