export const OUTPUT_FORMATS = ["jpeg", "png", "webp", "avif"] as const

export type OutputFormat = (typeof OUTPUT_FORMATS)[number]

export const FORMATS: Record<
  OutputFormat,
  { label: string; mime: string; extension: string; lossy: boolean }
> = {
  jpeg: { label: "JPEG", mime: "image/jpeg", extension: "jpg", lossy: true },
  png: { label: "PNG", mime: "image/png", extension: "png", lossy: false },
  webp: { label: "WebP", mime: "image/webp", extension: "webp", lossy: true },
  avif: { label: "AVIF", mime: "image/avif", extension: "avif", lossy: true },
}

/**
 * Every edit applied to an image, as plain serializable data. The same
 * recipe is sent to the engine worker for previews and final exports.
 */
export type ImageRecipe = {
  format: OutputFormat
  /** 1–100. Ignored by lossless formats. */
  quality: number
}

export const DEFAULT_QUALITY = 80

/** Starts from the source format when it can be written, WebP otherwise. */
export function initialRecipe(sourceMime: string): ImageRecipe {
  const format =
    OUTPUT_FORMATS.find((id) => FORMATS[id].mime === sourceMime) ?? "webp"
  return { format, quality: DEFAULT_QUALITY }
}
