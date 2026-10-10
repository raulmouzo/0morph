import type Vips from "wasm-vips"

import type { ImageRecipe } from "./recipe"

export type VipsInstance = typeof Vips

export type RenderResult = {
  data: Uint8Array
  width: number
  height: number
}

/**
 * AV1 encoding is slow in WebAssembly: effort 3 is ~7× faster than the
 * default (4) while producing files only slightly larger.
 */
const AVIF_EFFORT = 3

/** JPEG has no alpha channel; transparent areas become white, not black. */
const JPEG_BACKGROUND = [255, 255, 255]

export type ImageInfo = {
  width: number
  height: number
  hasAlpha: boolean
  hasIcc: boolean
  hasExif: boolean
}

/**
 * Runs `fn` and deletes every image it registered with `own` afterwards.
 * wasm-vips images live in WebAssembly memory and are not garbage collected,
 * so intermediate results must be deleted explicitly.
 */
function withOwned<T>(fn: (own: (image: Vips.Image) => Vips.Image) => T): T {
  const owned: Vips.Image[] = []
  try {
    return fn((image) => {
      owned.push(image)
      return image
    })
  } finally {
    for (const image of owned) image.delete()
  }
}

/**
 * Decodes an image and applies its EXIF orientation, so every later step
 * works on the image as it is displayed. The pixels are decoded once into
 * memory so repeated renders don't decode the file again.
 */
export function openSource(
  vips: VipsInstance,
  data: ArrayBuffer | Uint8Array
): Vips.Image {
  return withOwned((own) => {
    const decoded = own(vips.Image.newFromBuffer(data))
    const upright = own(decoded.autorot())
    return upright.copyMemory()
  })
}

function encode(image: Vips.Image, { format, quality }: ImageRecipe) {
  switch (format) {
    case "jpeg":
      // mozjpeg tuning, the same set sharp enables with `mozjpeg: true`.
      return image.jpegsaveBuffer({
        Q: quality,
        optimize_coding: true,
        interlace: true,
        trellis_quant: true,
        overshoot_deringing: true,
        optimize_scans: true,
        quant_table: 3,
      })
    case "png":
      return image.pngsaveBuffer({ compression: 9 })
    case "webp":
      return image.webpsaveBuffer({ Q: quality })
    case "avif":
      return image.heifsaveBuffer({
        Q: quality,
        compression: "av1",
        effort: AVIF_EFFORT,
      })
  }
}

/** Applies `recipe` to an image opened with `openSource` and encodes it. */
export function render(source: Vips.Image, recipe: ImageRecipe): RenderResult {
  return withOwned((own) => {
    let image = source
    if (recipe.format === "jpeg" && image.hasAlpha()) {
      image = own(image.flatten({ background: JPEG_BACKGROUND }))
    }
    return {
      data: encode(image, recipe),
      width: image.width,
      height: image.height,
    }
  })
}

export function readInfo(image: Vips.Image): ImageInfo {
  return {
    width: image.width,
    height: image.height,
    hasAlpha: image.hasAlpha(),
    hasIcc: image.getTypeof("icc-profile-data") !== 0,
    hasExif: image.getTypeof("exif-data") !== 0,
  }
}
