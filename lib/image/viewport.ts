import type { Size } from "./recipe"

export type Point = { x: number; y: number }

/** How content is placed on the canvas: its scale and top-left corner. */
export type View = { scale: number; x: number; y: number }

/** Largest zoom: 16 image pixels per screen pixel. */
export const MAX_SCALE = 16

/**
 * Empty space kept around the content when fitting it. Taller above and
 * below so the canvas's floating controls don't cover the image.
 */
const FIT_PADDING = { x: 32, y: 56 }

/** Part of the content that always stays inside the canvas when panning. */
const VISIBLE_MARGIN = 48

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/**
 * Scale that fits `content` inside `canvas`. Small images are not enlarged
 * past 100% so they show at their real size.
 */
export function fitScale(canvas: Size, content: Size) {
  return Math.min(
    (canvas.width - FIT_PADDING.x * 2) / content.width,
    (canvas.height - FIT_PADDING.y * 2) / content.height,
    1
  )
}

/** Zooming out goes down to a quarter of the fitted size. */
export function minScale(canvas: Size, content: Size) {
  return Math.max(fitScale(canvas, content) / 4, 0.01)
}

/** `content` centred at `scale`. */
export function centeredView(canvas: Size, content: Size, scale: number): View {
  return {
    scale,
    x: (canvas.width - content.width * scale) / 2,
    y: (canvas.height - content.height * scale) / 2,
  }
}

export function fitView(canvas: Size, content: Size): View {
  return centeredView(canvas, content, fitScale(canvas, content))
}

/**
 * Multiplies the scale by `factor`, keeping the content point under
 * `anchor` (canvas coordinates) in place.
 */
export function zoomAt(
  view: View,
  factor: number,
  anchor: Point,
  canvas: Size,
  content: Size
): View {
  const scale = clamp(view.scale * factor, minScale(canvas, content), MAX_SCALE)
  const ratio = scale / view.scale
  return clampView(
    {
      scale,
      x: anchor.x - (anchor.x - view.x) * ratio,
      y: anchor.y - (anchor.y - view.y) * ratio,
    },
    canvas,
    content
  )
}

export function panBy(
  view: View,
  delta: Point,
  canvas: Size,
  content: Size
): View {
  return clampView(
    { ...view, x: view.x + delta.x, y: view.y + delta.y },
    canvas,
    content
  )
}

/** Keeps at least a margin of the content inside the canvas. */
export function clampView(view: View, canvas: Size, content: Size): View {
  const width = content.width * view.scale
  const height = content.height * view.scale
  const marginX = Math.min(VISIBLE_MARGIN, width)
  const marginY = Math.min(VISIBLE_MARGIN, height)
  return {
    scale: view.scale,
    x: clamp(view.x, marginX - width, canvas.width - marginX),
    y: clamp(view.y, marginY - height, canvas.height - marginY),
  }
}
