import { useMemo, useState } from "react"
import { centerCrop, makeAspectCrop, type PercentCrop } from "react-image-crop"

import {
  IDENTITY_GEOMETRY,
  orientedSize,
  type CropRect,
  type Geometry,
  type Size,
} from "@/lib/image/recipe"
import { useReference } from "./use-render"

/** Longest side of the image shown while cropping; plenty for on-screen. */
const CROP_PREVIEW_MAX = 2048

const FULL: PercentCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 }

type Draft = { crop: PercentCrop; aspect: number | null }

/**
 * State for crop mode: the draft crop box, its aspect ratio, and the image
 * to draw it over (rotated and flipped, but not cropped or resized).
 */
export function useCropMode({
  imageKey,
  geometry,
  source,
  previewUrl,
  onApply,
}: {
  imageKey: string | null
  geometry: Geometry
  source: Size
  previewUrl: string
  onApply: (crop: CropRect) => void
}) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const oriented = orientedSize(source, geometry)

  const { rotate, flipHorizontal, flipVertical } = geometry
  const upright = rotate === 0 && !flipHorizontal && !flipVertical
  const backdropGeometry = useMemo<Geometry>(
    () => ({
      ...IDENTITY_GEOMETRY,
      rotate,
      flipHorizontal,
      flipVertical,
      maxDimension: CROP_PREVIEW_MAX,
    }),
    [rotate, flipHorizontal, flipVertical]
  )
  // The original file already shows the upright image.
  const backdrop = useReference(
    draft && !upright ? imageKey : null,
    backdropGeometry
  )

  return {
    active: draft !== null,
    crop: draft?.crop ?? FULL,
    aspect: draft?.aspect ?? null,
    /** Size of the image the crop box is drawn over. */
    size: oriented,
    src: upright ? previewUrl : (backdrop.output?.url ?? null),
    pending: backdrop.pending,
    start() {
      setDraft({
        crop: geometry.crop ? { unit: "%", ...geometry.crop } : FULL,
        aspect: null,
      })
    },
    cancel() {
      setDraft(null)
    },
    apply() {
      if (!draft) return
      const { x, y, width, height } = draft.crop
      onApply({ x, y, width, height })
      setDraft(null)
    },
    setCrop(crop: PercentCrop) {
      setDraft((current) => current && { ...current, crop })
    },
    setAspect(aspect: number | null) {
      setDraft(
        (current) =>
          current && {
            aspect,
            crop: aspect
              ? centerCrop(
                  makeAspectCrop(
                    { unit: "%", width: 90 },
                    aspect,
                    oriented.width,
                    oriented.height
                  ),
                  oriented.width,
                  oriented.height
                )
              : current.crop,
          }
      )
    },
  }
}
