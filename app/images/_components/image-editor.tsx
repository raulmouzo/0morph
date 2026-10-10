"use client"

import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Artboard } from "@/components/artboard"
import { useAsset } from "@/components/asset-provider"
import { Button } from "@/components/ui/button"
import { useCrossOriginIsolated } from "@/hooks/use-cross-origin-isolated"
import { formatBytes } from "@/lib/image/format"
import { useEngineImage } from "./use-engine-image"

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <Artboard className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        {children}
      </div>
    </Artboard>
  )
}

export function ImageEditor() {
  const { file, previewUrl, clearAsset } = useAsset()
  const isolated = useCrossOriginIsolated()
  const router = useRouter()

  if (!file || !previewUrl || !file.type.startsWith("image/")) {
    return (
      <Notice>
        <p className="text-sm text-muted-foreground">No image loaded yet.</p>
        <Link
          href="/"
          className="font-mono text-xs text-primary underline underline-offset-4"
        >
          Go back and import one
        </Link>
      </Notice>
    )
  }

  if (isolated === false) {
    return (
      <Notice>
        <p className="font-mono text-xs text-destructive uppercase">
          Unsupported browser
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          The image editor needs cross-origin isolation (SharedArrayBuffer),
          which this browser or page load doesn&apos;t provide. Try reloading
          the page or using a recent version of Chrome, Firefox or Safari.
        </p>
      </Notice>
    )
  }

  return (
    <Editor
      file={file}
      previewUrl={previewUrl}
      onReset={() => {
        clearAsset()
        router.push("/")
      }}
    />
  )
}

function Editor({
  file,
  previewUrl,
  onReset,
}: {
  file: File
  previewUrl: string
  onReset: () => void
}) {
  const image = useEngineImage(file)

  return (
    <Artboard className="mx-auto w-full max-w-4xl">
      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_16rem]">
        <section
          aria-label="Preview"
          className="flex min-h-80 items-center justify-center rounded-md border border-border bg-muted/40 p-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={file.name}
            className="max-h-[32rem] max-w-full object-contain"
          />
        </section>

        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-heading text-lg font-bold break-all text-foreground">
              {file.name}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {formatBytes(file.size)} · {file.type}
            </p>
          </div>

          {image.status === "loading" && (
            <p
              role="status"
              className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase"
            >
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Loading image engine…
            </p>
          )}

          {image.status === "error" && (
            <p role="alert" className="font-mono text-xs text-destructive">
              Couldn&apos;t read this image · {image.message}
            </p>
          )}

          {image.status === "ready" && (
            <p className="font-mono text-xs text-muted-foreground">
              {image.info.width} × {image.info.height} px
            </p>
          )}

          <Button variant="ghost" size="sm" onClick={onReset}>
            Import a different file
          </Button>
        </aside>
      </div>
    </Artboard>
  )
}
