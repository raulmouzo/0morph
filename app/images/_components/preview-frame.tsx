import { Loader2 } from "lucide-react"

import { Artboard } from "@/components/artboard"

/** Fallback shape while the image dimensions are still unknown. */
const DEFAULT_ASPECT = { width: 4, height: 3 }

/**
 * Artboard that takes the aspect ratio of the image it shows, so the image
 * fills the frame. It grows to the available width and caps its height at
 * --preview-max-h (70% of the viewport by default).
 */
export function PreviewFrame({
  width = DEFAULT_ASPECT.width,
  height = DEFAULT_ASPECT.height,
  busy,
  children,
}: {
  width?: number
  height?: number
  busy?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full justify-center">
      <div
        className="relative"
        style={{
          aspectRatio: `${width} / ${height}`,
          // --preview-max-h is set by the editor layout (shorter on phones).
          width: `min(100%, calc(var(--preview-max-h, 70vh) * ${width} / ${height}))`,
        }}
      >
        <Artboard className="h-full">{children}</Artboard>
        {busy && (
          <span
            role="status"
            className="absolute top-4 left-4 flex items-center gap-1.5 rounded-sm bg-background/80 px-2 py-1 font-mono text-[0.65rem] text-foreground uppercase backdrop-blur-sm"
          >
            <Loader2 className="size-3 animate-spin" aria-hidden />
            Rendering
          </span>
        )}
      </div>
    </div>
  )
}
