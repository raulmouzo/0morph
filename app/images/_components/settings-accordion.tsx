import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { ImageInfo } from "@/lib/image/pipeline"
import {
  cropPixels,
  FORMATS,
  framedSize,
  orientedSize,
  outputSize,
  type Encoding,
  type Geometry,
  type ImageRecipe,
} from "@/lib/image/recipe"
import { CropSettings } from "./crop-settings"
import { ExportSettings } from "./export-settings"
import { ResizeSettings } from "./resize-settings"
import { TransformSettings } from "./transform-settings"

export type SectionId = "transform" | "crop" | "resize" | "export"

function transformHint({ rotate, flipHorizontal, flipVertical }: Geometry) {
  const parts = [
    rotate !== 0 && `${rotate}°`,
    flipHorizontal && "flip H",
    flipVertical && "flip V",
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : "None"
}

function cropHint(info: ImageInfo, geometry: Geometry) {
  if (!geometry.crop) return "None"
  const { width, height } = cropPixels(
    orientedSize(info, geometry),
    geometry.crop
  )
  return `${width} × ${height}`
}

function resizeHint(info: ImageInfo, geometry: Geometry) {
  if (!geometry.resize && geometry.maxDimension === null) return "Original"
  const { width, height } = outputSize(info, geometry)
  return `${width} × ${height}`
}

function exportHint({ format, quality }: Encoding) {
  const { label, lossy } = FORMATS[format]
  return lossy ? `${label} ${quality}` : label
}

/**
 * Editing sections, one open at a time so the panel stays short and the
 * preview stays in view.
 */
export function SettingsAccordion({
  open,
  onOpenChange,
  recipe,
  info,
  crop,
  onGeometryChange,
  onEncodingChange,
}: {
  open: SectionId | null
  onOpenChange: (section: SectionId | null) => void
  recipe: ImageRecipe
  info: ImageInfo
  crop: {
    aspect: number | null
    batch: boolean
    onAspectChange: (aspect: number | null) => void
    onApply: () => void
    onCancel: () => void
    onRemove: () => void
  }
  onGeometryChange: (changes: Partial<Geometry>) => void
  onEncodingChange: (changes: Partial<Encoding>) => void
}) {
  const { geometry, encoding } = recipe

  return (
    <Accordion
      value={open ? [open] : []}
      onValueChange={(values) =>
        onOpenChange((values[0] as SectionId | undefined) ?? null)
      }
    >
      <AccordionItem value="transform">
        <AccordionTrigger hint={transformHint(geometry)}>
          Transform
        </AccordionTrigger>
        <AccordionPanel>
          <TransformSettings geometry={geometry} onChange={onGeometryChange} />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="crop">
        <AccordionTrigger hint={cropHint(info, geometry)}>
          Crop
        </AccordionTrigger>
        <AccordionPanel>
          <CropSettings
            aspect={crop.aspect}
            batch={crop.batch}
            cropped={geometry.crop !== null}
            onAspectChange={crop.onAspectChange}
            onApply={crop.onApply}
            onCancel={crop.onCancel}
            onRemove={crop.onRemove}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="resize">
        <AccordionTrigger hint={resizeHint(info, geometry)}>
          Resize
        </AccordionTrigger>
        <AccordionPanel>
          <ResizeSettings
            geometry={geometry}
            framed={framedSize(info, geometry)}
            onChange={onGeometryChange}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="export">
        <AccordionTrigger hint={exportHint(encoding)}>Export</AccordionTrigger>
        <AccordionPanel>
          <ExportSettings
            encoding={encoding}
            info={info}
            onChange={onEncodingChange}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
