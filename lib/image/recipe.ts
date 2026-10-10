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

/** Crop rectangle in percent (0–100) of the rotated, flipped image. */
export type CropRect = { x: number; y: number; width: number; height: number }

export const CROP_ASPECTS = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "3:2", value: 3 / 2 },
  { label: "2:3", value: 2 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
] as const

/** Longest-side limits offered for "max dimension". */
export const MAX_DIMENSIONS = [3840, 2560, 1920, 1280] as const

/** Upper bound for typed dimensions, to keep memory use reasonable. */
export const MAX_RESIZE = 16384

/**
 * Edits that change which pixels end up in the output. Applied in a fixed
 * order: rotate, flip, crop, resize, then limit the longest side.
 */
export type Geometry = {
  rotate: Rotation
  flipHorizontal: boolean
  flipVertical: boolean
  crop: CropRect | null
  resize: Resize | null
  /** Shrinks the image so its longest side is at most this many pixels. */
  maxDimension: number | null
}

/** How the output file is written. */
export type Encoding = {
  format: OutputFormat
  /** 1–100. Ignored by lossless formats. */
  quality: number
  /**
   * Drops EXIF (camera, GPS location), XMP, IPTC and the ICC profile.
   * Colours are converted to sRGB first so they still look the same.
   */
  stripMetadata: boolean
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
  crop: null,
  resize: null,
  maxDimension: null,
}

/** Starts from the source format when it can be written, WebP otherwise. */
export function initialRecipe(sourceMime: string): ImageRecipe {
  const format =
    OUTPUT_FORMATS.find((id) => FORMATS[id].mime === sourceMime) ?? "webp"
  return {
    geometry: IDENTITY_GEOMETRY,
    encoding: { format, quality: DEFAULT_QUALITY, stripMetadata: true },
  }
}

export function isIdentityGeometry(geometry: Geometry) {
  return (
    geometry.rotate === 0 &&
    !geometry.flipHorizontal &&
    !geometry.flipVertical &&
    geometry.crop === null &&
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

/** Size after rotating, before cropping. */
export function orientedSize(source: Size, geometry: Geometry): Size {
  return geometry.rotate % 180 === 0
    ? { width: source.width, height: source.height }
    : { width: source.height, height: source.width }
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/** The crop rectangle in whole pixels of an image of size `oriented`. */
export function cropPixels(oriented: Size, crop: CropRect) {
  const left = clamp(
    Math.round((crop.x / 100) * oriented.width),
    0,
    oriented.width - 1
  )
  const top = clamp(
    Math.round((crop.y / 100) * oriented.height),
    0,
    oriented.height - 1
  )
  return {
    left,
    top,
    width: clamp(
      Math.round((crop.width / 100) * oriented.width),
      1,
      oriented.width - left
    ),
    height: clamp(
      Math.round((crop.height / 100) * oriented.height),
      1,
      oriented.height - top
    ),
  }
}

/** Size after rotating and cropping, before any resizing. */
export function framedSize(source: Size, geometry: Geometry): Size {
  const oriented = orientedSize(source, geometry)
  if (!geometry.crop) return oriented
  const { width, height } = cropPixels(oriented, geometry.crop)
  return { width, height }
}

/** Applies the resize and max-dimension steps to a framed size. */
export function resizedSize(framed: Size, geometry: Geometry): Size {
  let size = framed
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
  return resizedSize(framedSize(source, geometry), geometry)
}

const isFullRect = (rect: CropRect) =>
  rect.x <= 0.01 &&
  rect.y <= 0.01 &&
  rect.width >= 99.99 &&
  rect.height >= 99.99

/**
 * Sets the crop (null, or one covering the whole image, removes it). A
 * proportional resize keeps its width and adapts its height to the new
 * framing.
 */
export function applyCrop(
  geometry: Geometry,
  crop: CropRect | null,
  source: Size
): Geometry {
  const next = { ...geometry, crop: crop && !isFullRect(crop) ? crop : null }
  const { resize } = geometry
  if (resize?.keepAspect) {
    const framed = framedSize(source, next)
    next.resize = {
      ...resize,
      height: Math.max(
        1,
        Math.round((resize.width * framed.height) / framed.width)
      ),
    }
  }
  return next
}

function rotateRect(rect: CropRect, clockwise: boolean): CropRect {
  return {
    x: clockwise ? 100 - rect.y - rect.height : rect.y,
    y: clockwise ? rect.x : 100 - rect.x - rect.width,
    width: rect.height,
    height: rect.width,
  }
}

function flipRect(rect: CropRect, horizontal: boolean): CropRect {
  return horizontal
    ? { ...rect, x: 100 - rect.x - rect.width }
    : { ...rect, y: 100 - rect.y - rect.height }
}

/**
 * Rotates what is currently shown by 90° in `direction`. Because flips are
 * applied after the rotation, rotating a flipped image swaps the flip axes
 * (rotating a horizontal mirror by 90° is a vertical mirror). The crop and
 * resize box turn with the image.
 */
export function rotateGeometry(
  geometry: Geometry,
  direction: "clockwise" | "counterclockwise"
): Geometry {
  const clockwise = direction === "clockwise"
  const { crop, resize } = geometry
  return {
    ...geometry,
    rotate: ((geometry.rotate + (clockwise ? 90 : 270)) % 360) as Rotation,
    flipHorizontal: geometry.flipVertical,
    flipVertical: geometry.flipHorizontal,
    crop: crop && rotateRect(crop, clockwise),
    resize: resize && {
      ...resize,
      width: resize.height,
      height: resize.width,
    },
  }
}

/** Mirrors what is currently shown along `axis`; the crop follows. */
export function flipGeometry(
  geometry: Geometry,
  axis: "horizontal" | "vertical"
): Geometry {
  const horizontal = axis === "horizontal"
  const crop = geometry.crop && flipRect(geometry.crop, horizontal)
  return horizontal
    ? { ...geometry, crop, flipHorizontal: !geometry.flipHorizontal }
    : { ...geometry, crop, flipVertical: !geometry.flipVertical }
}
