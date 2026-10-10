"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

import { useAsset } from "@/components/asset-provider"
import { detectCategory } from "@/lib/categories"

function extensionOf(name: string) {
  const ext = name.split(".").pop()
  return ext ? ext.toUpperCase() : "FILE"
}

export function ImportDropzone() {
  const router = useRouter()
  const { replaceAssets } = useAsset()
  const [detectedExt, setDetectedExt] = useState<string | null>(null)
  const [unsupported, setUnsupported] = useState<string | null>(null)
  const unsupportedTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  function handleFiles(files: File[]) {
    if (files.length === 0) return
    // The first supported file decides the tool; files of other kinds are
    // left out.
    const category = files.map(detectCategory).find((found) => found)

    if (!category) {
      setUnsupported(files[0].name)
      if (unsupportedTimeout.current) clearTimeout(unsupportedTimeout.current)
      unsupportedTimeout.current = setTimeout(() => setUnsupported(null), 2500)
      return
    }

    const supported = files.filter(
      (file) => detectCategory(file)?.id === category.id
    )
    setUnsupported(null)
    setDetectedExt(extensionOf(supported[0].name))
    replaceAssets(supported)
    setTimeout(() => router.push(category.href), 350)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(Array.from(e.target.files ?? []))
    e.target.value = ""
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    handleFiles(Array.from(e.dataTransfer.files ?? []))
  }

  const watermark = (detectedExt ?? "ANY").slice(0, 4)

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex w-full flex-col gap-10 overflow-hidden px-6 py-14 sm:px-12 sm:py-12"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-15 bottom-2 font-heading text-[5rem] font-black text-foreground/5 select-none"
      >
        {watermark}
      </span>

      <div className="flex flex-col items-center gap-4 text-center">
        <label className="flex size-20 cursor-pointer items-center justify-center border-2 border-foreground transition-colors hover:bg-foreground/5">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onInputChange}
            className="sr-only"
          />
          <Plus className="size-8 text-foreground" />
        </label>

        <div className="flex flex-col items-center gap-3">
          <h2 className="font-heading text-2xl font-bold text-foreground uppercase sm:text-3xl">
            Import images
          </h2>
          <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
            Drop one or more image files. Nothing ever leaves your browser.
          </p>
          {unsupported && (
            <p className="font-mono text-xs text-destructive uppercase">
              Unsupported format · {unsupported}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
