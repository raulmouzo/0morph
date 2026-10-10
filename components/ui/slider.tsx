"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

/** Single-thumb slider with a visible label and the current value. */
function Slider({
  label,
  className,
  ...props
}: SliderPrimitive.Root.Props<number> & { label: React.ReactNode }) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "flex w-full flex-col gap-1 data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between font-mono text-xs uppercase">
        <SliderPrimitive.Label className="text-muted-foreground">
          {label}
        </SliderPrimitive.Label>
        <SliderPrimitive.Value className="text-foreground" />
      </div>
      <SliderPrimitive.Control className="flex w-full touch-none items-center py-2 select-none">
        <SliderPrimitive.Track className="h-1 w-full rounded-full bg-foreground/15 select-none">
          <SliderPrimitive.Indicator className="rounded-full bg-primary select-none" />
          <SliderPrimitive.Thumb className="size-4 rounded-full border-2 border-primary bg-background select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/30" />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
