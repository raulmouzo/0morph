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

/** Clockwise rotation in degrees. */
export type Rotation = 0 | 90 | 180 | 270

/**
 * Edits that change which pixels end up in the output. Applied in a fixed
 * order: rotate, then flip.
 */
export type Geometry = {
  rotate: Rotation
  flipHorizontal: boolean
  flipVertical: boolean
}

/** How the output file is written. */
export type Encoding = {
  format: OutputFormat
  /** 1–100. Ignored by lossless formats. */
  quality: number
}

/**
 * Every edit applied to an image, as plain serializable data. The same
 * recipe is sent to the engine worker for previews and final exports.
 */
export type ImageRecipe = {
  geometry: Geometry
  encoding: Encoding
}

export const DEFAULT_QUALITY = 80

export const IDENTITY_GEOMETRY: Geometry = {
  rotate: 0,
  flipHorizontal: false,
  flipVertical: false,
}

/** Starts from the source format when it can be written, WebP otherwise. */
export function initialRecipe(sourceMime: string): ImageRecipe {
  const format =
    OUTPUT_FORMATS.find((id) => FORMATS[id].mime === sourceMime) ?? "webp"
  return {
    geometry: IDENTITY_GEOMETRY,
    encoding: { format, quality: DEFAULT_QUALITY },
  }
}

export function isIdentityGeometry(geometry: Geometry) {
  return (
    geometry.rotate === 0 && !geometry.flipHorizontal && !geometry.flipVertical
  )
}

/**
 * Rotates what is currently shown by 90° in `direction`. Because flips are
 * applied after the rotation, rotating a flipped image swaps the flip axes
 * (rotating a horizontal mirror by 90° is a vertical mirror).
 */
export function rotateGeometry(
  geometry: Geometry,
  direction: "clockwise" | "counterclockwise"
): Geometry {
  const delta = direction === "clockwise" ? 90 : 270
  return {
    ...geometry,
    rotate: ((geometry.rotate + delta) % 360) as Rotation,
    flipHorizontal: geometry.flipVertical,
    flipVertical: geometry.flipHorizontal,
  }
}

/** Mirrors what is currently shown along `axis`. */
export function flipGeometry(
  geometry: Geometry,
  axis: "horizontal" | "vertical"
): Geometry {
  return axis === "horizontal"
    ? { ...geometry, flipHorizontal: !geometry.flipHorizontal }
    : { ...geometry, flipVertical: !geometry.flipVertical }
}
