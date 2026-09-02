"use client"

import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useAsset } from "@/components/asset-provider"
import { cn } from "@/lib/utils"

type Sample = {
  id: string
  src: string
  alt: string
  filename: string
  mime: string
}

const SAMPLES: Sample[] = [
  {
    id: "gradient",
    src: "/samples/gradient-abstract.png",
    alt: "Abstract color gradient, PNG",
    filename: "gradient-abstract.png",
    mime: "image/png",
  },
  {
    id: "wizard",
    src: "/samples/wizard-portrait.webp",
    alt: "Portrait photo, WebP",
    filename: "wizard-portrait.webp",
    mime: "image/webp",
  },
  {
    id: "cameraman",
    src: "/samples/cameraman-wide.jpg",
    alt: "Wide landscape photo, JPEG",
    filename: "cameraman-wide.jpg",
    mime: "image/jpeg",
  },
  {
    id: "database",
    src: "/samples/database-shelf.avif",
    alt: "Server rack photo, AVIF",
    filename: "database-shelf.avif",
    mime: "image/avif",
  },
]

export function SampleGallery({ className }: { className?: string }) {
  const { setAsset } = useAsset()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function openSample(sample: Sample) {
    if (loadingId) return
    setLoadingId(sample.id)
    try {
      const res = await fetch(sample.src)
      const blob = await res.blob()
      const file = new File([blob], sample.filename, { type: sample.mime })
      setAsset(file)
      router.push("/images")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <p className="font-mono text-xs text-muted-foreground uppercase">
        Or try a sample
      </p>
      <div className="flex gap-3">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => openSample(sample)}
            disabled={loadingId !== null}
            aria-label={`Open sample: ${sample.alt}`}
            className="group relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-60 sm:size-20"
          >
            <Image
              src={sample.src}
              alt={sample.alt}
              fill
              quality={20}
              sizes="80px"
              className="object-cover"
            />
            {loadingId === sample.id && (
              <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                <Loader2 className="size-5 animate-spin text-foreground" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
