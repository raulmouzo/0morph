import { Artboard } from "@/components/artboard"
import { ImportDropzone } from "@/components/import-dropzone"
import { AUTHOR, SITE } from "@/lib/site"
import Hero from "../_components/hero"
import { SampleGallery } from "../_components/sample-gallery"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (runs in the browser)",
  browserRequirements: "Requires JavaScript and WebAssembly",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  featureList: [
    "Resize, crop, rotate and flip images",
    "Convert to JPEG, PNG, WebP and AVIF",
    "Compression with live file size",
    "Strip EXIF metadata",
    "Batch processing",
  ],
  author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
  sameAs: [SITE.repo],
}

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-4">
      <script
        type="application/ld+json"
        // Escaped so the JSON can't close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <Artboard className="align-center mx-auto flex h-full w-full max-w-4xl">
        <div className="flex h-full w-full items-center justify-center align-middle">
          <ImportDropzone />
        </div>
      </Artboard>
      <SampleGallery />
    </div>
  )
}
