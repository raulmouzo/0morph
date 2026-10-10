import { formatBytes, formatSizeChange } from "@/lib/image/format"
import { cn } from "@/lib/utils"

/**
 * Card describing one side of the comparison: its format, file size and
 * dimensions, plus the size change on the "after" side. It repeats what the
 * Result panel says, so it is hidden from assistive technology.
 */
export function ImageStats({
  label,
  format,
  size,
  width,
  height,
  originalSize,
  align = "start",
}: {
  label: string
  format: string
  /** File size in bytes, or null while it is still being rendered. */
  size: number | null
  width: number
  height: number
  /** Original file size, to show the change against it. */
  originalSize?: number
  align?: "start" | "end"
}) {
  const shrank =
    size !== null && originalSize !== undefined && size <= originalSize

  return (
    <div
      aria-hidden
      className={cn(
        "flex flex-col gap-0.5 rounded-md border border-border bg-background/85 px-2.5 py-1.5 font-mono text-[0.65rem] leading-tight backdrop-blur-sm",
        align === "end" ? "items-end text-right" : "items-start"
      )}
    >
      <p className="flex gap-2 font-bold text-muted-foreground uppercase">
        {label}
        {size !== null && originalSize !== undefined && (
          <span
            className={
              shrank
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }
          >
            {formatSizeChange(originalSize, size)}
          </span>
        )}
      </p>
      <p className="text-foreground">
        {format} · {size === null ? "…" : formatBytes(size)}
      </p>
      {/* Dimensions are dropped on narrow canvases to keep the card small. */}
      <p className="text-muted-foreground @max-md:hidden">
        {width} × {height}
      </p>
    </div>
  )
}
