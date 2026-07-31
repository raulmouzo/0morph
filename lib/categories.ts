import type { ComponentType, SVGProps } from "react"

import { AudioIcon, ImagesIcon, VideoIcon } from "@/components/icons/app-icons"

export type Category = {
  id: "images" | "video" | "audio"
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  glow: string
  mimePrefix: string
}

export const CATEGORIES: Category[] = [
  {
    id: "images",
    label: "images",
    href: "/images",
    icon: ImagesIcon,
    glow: "bg-accent/50",
    mimePrefix: "image/",
  },
  {
    id: "video",
    label: "video",
    href: "/video",
    icon: VideoIcon,
    glow: "bg-secondary/20",
    mimePrefix: "video/",
  },
  {
    id: "audio",
    label: "audio",
    href: "/audio",
    icon: AudioIcon,
    glow: "bg-primary/25",
    mimePrefix: "audio/",
  },
]

export function detectCategory(file: File) {
  return CATEGORIES.find((category) =>
    file.type.startsWith(category.mimePrefix)
  )
}

export function getCategory(id: Category["id"]) {
  return CATEGORIES.find((category) => category.id === id)!
}
