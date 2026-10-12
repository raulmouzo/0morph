import type { Metadata } from "next"

import { SITE } from "@/lib/site"
import { ImageEditor } from "./_components/image-editor"

const description =
  "Resize, crop, rotate and compress images, convert them to JPEG, PNG, WebP or AVIF and strip their metadata, one at a time or in batches. Everything runs in your browser: your images are never uploaded."

const title = "Image editor — resize, crop, convert & compress"

// openGraph and twitter replace the root layout's objects, not merge them.
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/images" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: "/images",
    title: `${title} · ${SITE.name}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${SITE.name}`,
    description,
  },
}

export default function ImagesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <ImageEditor />
    </div>
  )
}
