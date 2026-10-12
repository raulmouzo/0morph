import { OG_SIZE, renderOgImage } from "@/lib/og"

export const alt = "0morph — private file tools that run in your browser"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    word: "Apps",
    tagline: "No uploads. No accounts. No servers.",
  })
}
