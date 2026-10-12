import { OG_SIZE, renderOgImage } from "@/lib/og"

export const alt = "0morph images — resize, crop, convert and compress images"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    word: "Images",
    tagline: "Resize, crop, convert. JPEG · PNG · WebP · AVIF",
  })
}
