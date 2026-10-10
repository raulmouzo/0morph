import { FORMATS, OUTPUT_FORMATS, type OutputFormat } from "./recipe"

const UNITS = ["B", "KB", "MB", "GB"] as const

/** Human-readable size using 1024-based units, e.g. 1.5 MB. */
export function formatBytes(bytes: number) {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit++
  }
  const digits = unit === 0 ? 0 : value < 10 ? 2 : 1
  return `${value.toFixed(digits)} ${UNITS[unit]}`
}

/**
 * Signed size change from `before` to `after`, e.g. "−63%" or "+12%".
 * Near 0% and 100% one decimal is kept, so a 99.7% saving doesn't read as
 * "−100%" and a tiny change doesn't read as "0%".
 */
export function formatSizeChange(before: number, after: number) {
  if (before === 0) return "—"
  const change = ((after - before) / before) * 100
  if (change === 0) return "0%"
  const magnitude = Math.abs(change)
  const digits = magnitude < 1 || magnitude >= 99 ? 1 : 0
  const value = magnitude.toFixed(digits)
  return change < 0 ? `−${value}%` : `+${value}%`
}

/** Original name with the extension of the output format. */
export function outputFileName(sourceName: string, format: OutputFormat) {
  const dot = sourceName.lastIndexOf(".")
  const base = dot > 0 ? sourceName.slice(0, dot) : sourceName
  return `${base}.${FORMATS[format].extension}`
}

/** Short name of a file's format, e.g. "PNG", from its MIME type or name. */
export function sourceFormatLabel(file: { type: string; name: string }) {
  const known = OUTPUT_FORMATS.find((id) => FORMATS[id].mime === file.type)
  if (known) return FORMATS[known].label
  const subtype = file.type.split("/")[1]?.replace(/^x-/, "").split("+")[0]
  if (subtype) return subtype.toUpperCase()
  const dot = file.name.lastIndexOf(".")
  return dot > 0 ? file.name.slice(dot + 1).toUpperCase() : "Original"
}
