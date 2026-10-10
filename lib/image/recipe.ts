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

export type Size = { width: number; height: number }

export type Resize = Size & {
  /**
   * When true the image is scaled to fit inside width × height keeping its
   * proportions; when false it is stretched to exactly width × height.
   */
  keepAspect: boolean
}

/** Longest-side limits offered for "max dimension". */
export const MAX_DIMENSIONS = [3840, 2560, 1920, 1280] as const

/** Upper bound for typed dimensions, to keep memory use reasonable. */
export const MAX_RESIZE = 16384

/**
 * Edits that change which pixels end up in the output. Applied in a fixed
 * order: rotate, flip, resize, then limit the longest side.
 */
export type Geometry = {
  rotate: Rotation
  flipHorizontal: boolean
  flipVertical: boolean
  resize: Resize | null
  /** Shrinks the image so its longest side is at most this many pixels. */
  maxDimension: number | null
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
  resize: null,
  maxDimension: null,
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
    geometry.rotate === 0 &&
    !geometry.flipHorizontal &&
    !geometry.flipVertical &&
    geometry.resize === null &&
    geometry.maxDimension === null
  )
}

function scaleSize({ width, height }: Size, scale: number): Size {
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/** Size after rotating, before any resizing. */
export function orientedSize(source: Size, geometry: Geometry): Size {
  return geometry.rotate % 180 === 0
    ? { width: source.width, height: source.height }
    : { width: source.height, height: source.width }
}

/** Applies the resize and max-dimension steps to an oriented size. */
export function resizedSize(oriented: Size, geometry: Geometry): Size {
  let size = oriented
  const { resize, maxDimension } = geometry
  if (resize) {
    size = resize.keepAspect
      ? scaleSize(
          size,
          Math.min(resize.width / size.width, resize.height / size.height)
        )
      : { width: resize.width, height: resize.height }
  }
  const longest = Math.max(size.width, size.height)
  if (maxDimension !== null && longest > maxDimension) {
    size = scaleSize(size, maxDimension / longest)
  }
  return size
}

/** Final output size for a source of the given size. */
export function outputSize(source: Size, geometry: Geometry): Size {
  return resizedSize(orientedSize(source, geometry), geometry)
}

/**
 * Rotates what is currently shown by 90° in `direction`. Because flips are
 * applied after the rotation, rotating a flipped image swaps the flip axes
 * (rotating a horizontal mirror by 90° is a vertical mirror). A resize box
 * turns with the image.
 */
export function rotateGeometry(
  geometry: Geometry,
  direction: "clockwise" | "counterclockwise"
): Geometry {
  const delta = direction === "clockwise" ? 90 : 270
  const { resize } = geometry
  return {
    ...geometry,
    rotate: ((geometry.rotate + delta) % 360) as Rotation,
    flipHorizontal: geometry.flipVertical,
    flipVertical: geometry.flipHorizontal,
    resize: resize && {
      ...resize,
      width: resize.height,
      height: resize.width,
    },
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
