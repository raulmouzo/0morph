"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { Artboard } from "@/components/artboard"
import { useAsset } from "@/components/asset-provider"
import { Button } from "@/components/ui/button"
import { getCategory, type Category } from "@/lib/categories"

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function AssetWorkspace({ categoryId }: { categoryId: Category["id"] }) {
  const { assets, clearAssets } = useAsset()
  const file = assets[0]?.file
  const previewUrl = assets[0]?.previewUrl
  const router = useRouter()
  const category = getCategory(categoryId)

  const matches =
    file && previewUrl && file.type.startsWith(category.mimePrefix)

  if (!matches) {
    return (
      <Artboard className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No {category.label} asset loaded yet.
          </p>
          <Link
            href="/"
            className="font-mono text-xs text-primary underline underline-offset-4"
          >
            Go back and import one
          </Link>
        </div>
      </Artboard>
    )
  }

  return (
    <Artboard className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col items-center gap-6 px-6 py-12 text-center">
        <span className="font-mono text-xs text-muted-foreground uppercase">
          {category.label} editor · coming soon
        </span>

        {category.id === "images" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={file.name}
            className="max-h-96 max-w-full rounded-md border border-border"
          />
        )}
        {category.id === "video" && (
          <video
            src={previewUrl}
            controls
            className="max-h-96 max-w-full rounded-md border border-border"
          />
        )}
        {category.id === "audio" && (
          <audio src={previewUrl} controls className="w-full max-w-md" />
        )}

        <div className="flex flex-col gap-1">
          <p className="font-heading text-xl font-bold text-foreground">
            {file.name}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatSize(file.size)} · {file.type}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearAssets()
            router.push("/")
          }}
        >
          Import a different file
        </Button>
      </div>
    </Artboard>
  )
}
