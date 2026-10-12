"use client"

import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useAsset } from "@/components/asset-provider"
import { formatBytes } from "@/lib/image/format"
import { cn } from "@/lib/utils"

/**
 * Untouched originals (full size, with their metadata), so a sample shows
 * what a real conversion saves. The thumbnails are served optimized by
 * next/image; only a click downloads the original.
 */
type Sample = {
  id: string
  src: string
  alt: string
  filename: string
  mime: string
  format: string
  /** Size of the original file, in bytes. */
  bytes: number
  author: string
  /** The photo's page on Unsplash. */
  credit: string
}

const SAMPLES: Sample[] = [
  {
    id: "blackbird",
    src: "/samples/blackbird-berries.jpg",
    alt: "Blackbird eating berries on a bare branch",
    filename: "blackbird-berries.jpg",
    mime: "image/jpeg",
    format: "JPEG",
    bytes: 1326589,
    author: "Bastian Cimander",
    credit: "https://unsplash.com/photos/1_tJ8v3ORxE",
  },
  {
    id: "suit",
    src: "/samples/suit-portrait.webp",
    alt: "Seated man in a grey suit and teal tie, hands clasped",
    filename: "suit-portrait.webp",
    mime: "image/webp",
    format: "WebP",
    bytes: 1498544,
    author: "Christian Agbede",
    credit: "https://unsplash.com/photos/SyFlFwnc4hc",
  },
  {
    id: "skylight",
    src: "/samples/skylight-dome.avif",
    alt: "Stained glass skylight above an ornate stairwell balustrade",
    filename: "skylight-dome.avif",
    mime: "image/avif",
    format: "AVIF",
    bytes: 1560203,
    author: "Guanghao Zhang",
    credit: "https://unsplash.com/photos/npEsm1f-4lI",
  },
  {
    id: "glass",
    src: "/samples/pink-glass.png",
    alt: "Close-up of stacked pink translucent glass shapes",
    filename: "pink-glass.png",
    mime: "image/png",
    format: "PNG",
    bytes: 13791609,
    author: "Willy the Wizard",
    credit: "https://unsplash.com/photos/h97UEoe3kqc",
  },
]

export function SampleGallery({ className }: { className?: string }) {
  const { replaceAssets } = useAsset()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function openSample(sample: Sample) {
    if (loadingId) return
    setLoadingId(sample.id)
    try {
      const res = await fetch(sample.src)
      const blob = await res.blob()
      const file = new File([blob], sample.filename, { type: sample.mime })
      replaceAssets([file])
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
      <ul className="flex gap-3">
        {SAMPLES.map((sample) => (
          <li key={sample.id} className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => openSample(sample)}
              disabled={loadingId !== null}
              aria-label={`Open sample: ${sample.alt}, ${sample.format}, ${formatBytes(sample.bytes)}`}
              title={`${sample.alt} · Photo by ${sample.author}`}
              className="group relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-60 sm:size-20"
            >
              {/* Placeholder until the thumbnail paints over it. */}
              <span
                aria-hidden
                className="absolute inset-0 animate-pulse bg-muted"
              />
              <Image
                src={sample.src}
                alt={sample.alt}
                fill
                quality={75}
                sizes="(min-width: 640px) 80px, 64px"
                className="object-cover"
              />
              {loadingId === sample.id && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="size-5 animate-spin text-foreground" />
                </span>
              )}
            </button>
            <span className="font-mono text-[0.65rem] leading-none text-muted-foreground">
              {sample.format} · {formatBytes(sample.bytes)}
            </span>
          </li>
        ))}
      </ul>
      <p className="max-w-2xl text-center text-[0.65rem] text-balance text-muted-foreground/80">
        Photos by{" "}
        {SAMPLES.map((sample, i) => (
          <span key={sample.id}>
            <a
              href={sample.credit}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              {sample.author}
            </a>
            {i < SAMPLES.length - 2
              ? ", "
              : i === SAMPLES.length - 2
                ? " and "
                : ""}
          </span>
        ))}{" "}
        on Unsplash
      </p>
    </div>
  )
}
