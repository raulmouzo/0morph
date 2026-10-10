"use client"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"

/** A row of mutually exclusive options, built on an accessible radio group. */
function SegmentedControl<Value extends string>({
  className,
  ...props
}: RadioGroup.Props<Value>) {
  return (
    <RadioGroup
      data-slot="segmented-control"
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-px rounded-md border border-border bg-border p-px",
        className
      )}
      {...props}
    />
  )
}

function SegmentedControlItem({ className, ...props }: Radio.Root.Props) {
  return (
    <Radio.Root
      data-slot="segmented-control-item"
      className={cn(
        "flex h-7 cursor-pointer items-center justify-center bg-background px-2 font-mono text-xs text-muted-foreground transition-colors outline-none select-none first:rounded-l-[calc(var(--radius-md)-1px)] last:rounded-r-[calc(var(--radius-md)-1px)] hover:text-foreground focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/30 data-checked:bg-primary data-checked:text-primary-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
