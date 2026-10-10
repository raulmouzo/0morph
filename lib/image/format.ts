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
