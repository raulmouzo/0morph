import {
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { flipGeometry, rotateGeometry, type Geometry } from "@/lib/image/recipe"

function ToolButton({
  label,
  icon: Icon,
  pressed,
  onClick,
}: {
  label: string
  icon: LucideIcon
  pressed?: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={pressed ? "secondary" : "outline"}
            size="icon-lg"
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
          />
        }
      >
        <Icon aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function TransformSettings({
  geometry,
  onChange,
}: {
  geometry: Geometry
  onChange: (geometry: Geometry) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <ToolButton
        label="Rotate left"
        icon={RotateCcw}
        onClick={() => onChange(rotateGeometry(geometry, "counterclockwise"))}
      />
      <ToolButton
        label="Rotate right"
        icon={RotateCw}
        onClick={() => onChange(rotateGeometry(geometry, "clockwise"))}
      />
      <ToolButton
        label="Flip horizontally"
        icon={FlipHorizontal2}
        pressed={geometry.flipHorizontal}
        onClick={() => onChange(flipGeometry(geometry, "horizontal"))}
      />
      <ToolButton
        label="Flip vertically"
        icon={FlipVertical2}
        pressed={geometry.flipVertical}
        onClick={() => onChange(flipGeometry(geometry, "vertical"))}
      />
    </div>
  )
}
