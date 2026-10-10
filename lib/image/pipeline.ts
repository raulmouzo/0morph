import type Vips from "wasm-vips"

export type VipsInstance = typeof Vips

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

export function readInfo(image: Vips.Image): ImageInfo {
  return {
    width: image.width,
    height: image.height,
    hasAlpha: image.hasAlpha(),
    hasIcc: image.getTypeof("icc-profile-data") !== 0,
    hasExif: image.getTypeof("exif-data") !== 0,
  }
}
