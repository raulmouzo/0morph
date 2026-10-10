import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider"

import { cn } from "@/lib/utils"

function Label({
  side,
  children,
}: {
  side: "left" | "right"
  children: React.ReactNode
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-3 z-10 rounded-sm bg-background/80 px-2 py-1 font-mono text-[0.65rem] text-foreground uppercase backdrop-blur-sm",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      {children}
    </span>
  )
}

/** Draggable before/after split between the original and the output. */
export function CompareView({
  before,
  after,
  alt,
  afterLabel,
}: {
  before: string
  after: string
  alt: string
  afterLabel: string
}) {
  return (
    <div className="relative size-full">
      <ReactCompareSlider
        className="size-full"
        itemOne={
          <ReactCompareSliderImage src={before} alt={`${alt}, before`} />
        }
        itemTwo={<ReactCompareSliderImage src={after} alt={`${alt}, after`} />}
      />
      <Label side="left">Before</Label>
      <Label side="right">{afterLabel}</Label>
    </div>
  )
}
