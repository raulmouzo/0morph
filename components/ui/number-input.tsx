"use client"

import { NumberField } from "@base-ui/react/number-field"
import { useId } from "react"

import { cn } from "@/lib/utils"

/**
 * Labelled numeric input. Pressing Enter blurs the field, which commits the
 * typed value (see `onValueCommitted`).
 */
function NumberInput({
  label,
  className,
  format = { useGrouping: false },
  ...props
}: NumberField.Root.Props & { label: string }) {
  const id = useId()
  return (
    <NumberField.Root
      id={id}
      data-slot="number-input"
      className={cn("flex min-w-0 flex-col gap-1", className)}
      format={format}
      {...props}
    >
      <label
        htmlFor={id}
        className="font-mono text-xs text-muted-foreground uppercase"
      >
        {label}
      </label>
      <NumberField.Input
        className="h-7 w-full min-w-0 rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 data-disabled:opacity-50"
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
        }}
      />
    </NumberField.Root>
  )
}

export { NumberInput }
