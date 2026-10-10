import { Download, Loader2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  formatBytes,
  formatSizeChange,
  outputFileName,
} from "@/lib/image/format"
import type { ImageRecipe } from "@/lib/image/recipe"
import { cn } from "@/lib/utils"
import { SettingsSection } from "./settings-section"
import type { Rendered } from "./use-render"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  )
}

export function OutputSummary({
  sourceName,
  sourceSize,
  output,
  pending,
  error,
  downloadLabel = "Download",
  children,
}: {
  sourceName: string
  sourceSize: number
  output: Rendered<ImageRecipe> | null
  pending: boolean
  error: string | null
  downloadLabel?: string
  /** Extra actions below the download button (e.g. the batch export). */
  children?: React.ReactNode
}) {
  return (
    <SettingsSection title="Result">
      <dl className="flex flex-col gap-1 font-mono text-xs" aria-live="polite">
        <Row label="Before" value={formatBytes(sourceSize)} />
        <Row
          label="After"
          value={
            output ? (
              <>
                {formatBytes(output.size)}{" "}
                <span
                  className={cn(
                    output.size <= sourceSize
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  )}
                >
                  ({formatSizeChange(sourceSize, output.size)})
                </span>
              </>
            ) : (
              "—"
            )
          }
        />
        <Row
          label="Size"
          value={output ? `${output.width} × ${output.height}` : "—"}
        />
      </dl>

      {error && (
        <p role="alert" className="font-mono text-xs text-destructive">
          Couldn&apos;t render · {error}
        </p>
      )}

      {pending ? (
        <Button size="lg" className="w-full" disabled>
          <Loader2 className="animate-spin" aria-hidden />
          Rendering…
        </Button>
      ) : output ? (
        <a
          href={output.url}
          download={outputFileName(sourceName, output.input.encoding.format)}
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          <Download aria-hidden />
          {downloadLabel}
        </a>
      ) : (
        <Button size="lg" className="w-full" disabled>
          <Download aria-hidden />
          {downloadLabel}
        </Button>
      )}
      {children}
    </SettingsSection>
  )
}
