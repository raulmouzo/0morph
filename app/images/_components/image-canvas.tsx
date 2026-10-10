import { Maximize, Minimize, Minus, Plus } from "lucide-react"
import { useEffect, useEffectEvent, useId, useRef, useState } from "react"
import { ReactCompareSlider } from "react-compare-slider"

import { Artboard } from "@/components/artboard"
import { Button } from "@/components/ui/button"
import { useElementSize } from "@/hooks/use-element-size"
import type { Size } from "@/lib/image/recipe"
import {
  fitView,
  panBy,
  zoomAt,
  type Point,
  type View,
} from "@/lib/image/viewport"
import { cn } from "@/lib/utils"

/** Space between the artboard's frame and the image, in CSS pixels. */
const IMAGE_PADDING = 12
/** The Artboard's own inner padding (its `p-1`). */
const ARTBOARD_PADDING = 4
/** Total distance from the artboard's outer edge to the image. */
const FRAME = ARTBOARD_PADDING + IMAGE_PADDING

const ZOOM_STEP = 1.25
const PAN_STEP = 48

export type OverlayPosition =
  "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomRight"

/** UI fixed to the canvas, by position. The bottom centre is the zoom bar. */
export type CanvasOverlays = Partial<Record<OverlayPosition, React.ReactNode>>

/**
 * Cell of each overlay in the HUD grid: three columns (left, centre, right)
 * and a top and bottom row. On narrow canvases the zoom bar moves to a row
 * of its own below the bottom corners so they don't collide.
 */
const OVERLAY_CELL: Record<OverlayPosition | "bottomCenter", string> = {
  topLeft: "col-start-1 row-start-1 self-start justify-self-start",
  topCenter: "col-start-2 row-start-1 self-start justify-self-center",
  topRight: "col-start-3 row-start-1 self-start justify-self-end",
  bottomLeft: "col-start-1 row-start-3 self-end justify-self-start",
  bottomCenter:
    "col-start-2 row-start-3 self-end justify-self-center @max-2xl:col-span-3 @max-2xl:col-start-1 @max-2xl:row-start-4",
  bottomRight: "col-start-3 row-start-3 self-end justify-self-end",
}

const OVERLAY_ORDER: OverlayPosition[] = [
  "topLeft",
  "topCenter",
  "topRight",
  "bottomLeft",
  "bottomRight",
]

type Pinch = { distance: number; mid: Point }

function measurePinch(points: Map<number, Point>): Pinch | null {
  const [a, b] = [...points.values()]
  if (!a || !b) return null
  return {
    distance: Math.hypot(b.x - a.x, b.y - a.y),
    mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  }
}

function localPoint(event: React.PointerEvent<HTMLElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

/** Overlay controls take their own clicks; they never start a drag. */
const stopDrag = (event: React.PointerEvent) => event.stopPropagation()

/** An image filling its artboard frame on the canvas. */
export function CanvasImage({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="block size-full" />
}

/**
 * Fixed-size canvas (with a dot grid) the image sits on. It has two layers:
 *
 * - Content: the artboard framing the image (`children`). It is fitted when
 *   the image or its size changes, then moves and scales with the view
 *   (drag, wheel, pinch, keyboard, zoom bar). With `before`, the content is
 *   drawn twice, before and after, split by a divider that spans the whole
 *   canvas: `before` shows on its left and `children` on its right.
 * - HUD: controls and information (`overlays` plus the zoom bar), fixed to
 *   the canvas edges whatever the zoom.
 */
export function ImageCanvas({
  imageSize: content,
  resetKey,
  panFromContent,
  fullscreen,
  onToggleFullscreen,
  overlays = {},
  before,
  children,
}: {
  /** Size in pixels of the image shown, or null while unknown. */
  imageSize: Size | null
  /** Changing it fits the image again (e.g. another image is selected). */
  resetKey: string
  /** Whether dragging on the image pans; off while cropping. */
  panFromContent: boolean
  fullscreen: boolean
  onToggleFullscreen: () => void
  overlays?: CanvasOverlays
  /** The "before" image; when given, the canvas shows a before/after split. */
  before?: React.ReactNode
  /** The image (the "after" side when comparing). */
  children: React.ReactNode
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const canvas = useElementSize(canvasRef)
  const hintId = useId()

  // The view is fitted again whenever what's shown or the canvas changes
  // size; zooming and panning only adjust it in between.
  const viewKey =
    canvas && content
      ? `${resetKey}|${canvas.width}x${canvas.height}|${content.width}x${content.height}`
      : null
  const [state, setState] = useState<{ key: string; view: View } | null>(null)
  if (viewKey && canvas && content && state?.key !== viewKey) {
    setState({ key: viewKey, view: fitView(canvas, content) })
  }
  const view = state?.key === viewKey ? state.view : null

  const updateView = (
    change: (view: View, canvas: Size, content: Size) => View
  ) => {
    if (!canvas || !content) return
    setState(
      (current) =>
        current && { ...current, view: change(current.view, canvas, content) }
    )
  }
  const center = (size: Size) => ({ x: size.width / 2, y: size.height / 2 })
  const zoomBy = (factor: number, anchor?: Point) =>
    updateView((v, c, s) => zoomAt(v, factor, anchor ?? center(c), c, s))
  const fit = () => updateView((_, c, s) => fitView(c, s))
  const actualSize = () =>
    updateView((v, c, s) => zoomAt(v, 1 / v.scale, center(c), c, s))
  const move = (delta: Point) => updateView((v, c, s) => panBy(v, delta, c, s))

  // React's onWheel is passive, so the page would scroll too; listen
  // natively to be able to prevent that.
  const onWheel = useEffectEvent((event: WheelEvent) => {
    event.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
    // Trackpad pinches arrive as ctrl+wheel with small deltas.
    const factor = Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0015))
    zoomBy(factor, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  })
  useEffect(() => {
    const element = canvasRef.current
    if (!element) return
    const listener = (event: WheelEvent) => onWheel(event)
    element.addEventListener("wheel", listener, { passive: false })
    return () => element.removeEventListener("wheel", listener)
  }, [])

  const pointers = useRef(new Map<number, Point>())
  const pinch = useRef<Pinch | null>(null)
  const [dragging, setDragging] = useState(false)

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    const target = event.target as Element
    // The comparison handle and (while cropping) the image handle their own
    // drags.
    if (target.closest('[data-rcs="handle-root"]')) return
    if (!panFromContent && target.closest("[data-canvas-content]")) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, localPoint(event))
    pinch.current = measurePinch(pointers.current)
    setDragging(true)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId)
    if (!previous) return
    const point = localPoint(event)
    pointers.current.set(event.pointerId, point)

    if (pointers.current.size === 1) {
      move({ x: point.x - previous.x, y: point.y - previous.y })
      return
    }
    const start = pinch.current
    const next = measurePinch(pointers.current)
    if (!start || !next) return
    updateView((v, c, s) =>
      zoomAt(
        panBy(
          v,
          { x: next.mid.x - start.mid.x, y: next.mid.y - start.mid.y },
          c,
          s
        ),
        next.distance / start.distance,
        next.mid,
        c,
        s
      )
    )
    pinch.current = next
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId)
    pinch.current = measurePinch(pointers.current)
    if (pointers.current.size === 0) setDragging(false)
  }

  /** The artboard with an image, placed and scaled by the view. */
  function framed(image: React.ReactNode) {
    if (!view || !content) return null
    return (
      <div
        data-canvas-content
        className={cn(
          "absolute top-0 left-0",
          // Past 100% show real pixels, to judge compression artifacts.
          view.scale > 1 && "[&_img]:[image-rendering:pixelated]"
        )}
        style={{
          width: Math.round(content.width * view.scale) + FRAME * 2,
          height: Math.round(content.height * view.scale) + FRAME * 2,
          transform: `translate(${Math.round(view.x) - FRAME}px, ${Math.round(view.y) - FRAME}px)`,
        }}
      >
        <Artboard className="h-full">
          <div className="size-full" style={{ padding: IMAGE_PADDING }}>
            {image}
          </div>
        </Artboard>
      </div>
    )
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // Only when the canvas itself has focus, not the comparison handle.
    if (event.target !== event.currentTarget) return
    const actions: Record<string, () => void> = {
      "+": () => zoomBy(ZOOM_STEP),
      "=": () => zoomBy(ZOOM_STEP),
      "-": () => zoomBy(1 / ZOOM_STEP),
      "0": fit,
      "1": actualSize,
      ArrowLeft: () => move({ x: -PAN_STEP, y: 0 }),
      ArrowRight: () => move({ x: PAN_STEP, y: 0 }),
      ArrowUp: () => move({ x: 0, y: -PAN_STEP }),
      ArrowDown: () => move({ x: 0, y: PAN_STEP }),
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  return (
    <div
      ref={canvasRef}
      role="group"
      aria-label="Image canvas"
      aria-describedby={hintId}
      tabIndex={0}
      className={cn(
        "@container relative size-full touch-none overflow-hidden rounded-md border border-border bg-canvas outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50",
        dragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        backgroundImage:
          "radial-gradient(var(--color-canvas-dot) 1px, transparent 1.5px)",
        backgroundSize: "16px 16px",
        // The dots move with the image, like a design tool's canvas.
        backgroundPosition: view
          ? `${Math.round(view.x)}px ${Math.round(view.y)}px`
          : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      // A native image drag would steal the pointer from panning.
      onDragStart={(event) => event.preventDefault()}
      onKeyDown={onKeyDown}
    >
      <p id={hintId} className="sr-only">
        Drag to move the image. Scroll, pinch, or press plus and minus to zoom;
        0 fits it and 1 shows it at actual size.
      </p>

      {/* Content layer: moves and scales with the view. */}
      {before ? (
        // The split covers the whole canvas, so the divider runs from top
        // to bottom wherever the image is. Only its handle moves it;
        // dragging anywhere else pans.
        <div className="absolute inset-0">
          <ReactCompareSlider
            className="size-full"
            onlyHandleDraggable
            itemOne={framed(before)}
            itemTwo={framed(children)}
          />
        </div>
      ) : (
        framed(children)
      )}

      {/* HUD layer: fixed to the canvas; only its controls take clicks. */}
      <div className="pointer-events-none absolute inset-0 z-20 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] grid-rows-[auto_1fr_auto] gap-2 p-3 @max-2xl:grid-rows-[auto_1fr_auto_auto]">
        {OVERLAY_ORDER.map(
          (position) =>
            overlays[position] && (
              <div
                key={position}
                className={cn("pointer-events-auto", OVERLAY_CELL[position])}
                onPointerDown={stopDrag}
              >
                {overlays[position]}
              </div>
            )
        )}

        <div
          role="toolbar"
          aria-label="Zoom"
          className={cn(
            "pointer-events-auto flex items-center gap-0.5 rounded-md border border-border bg-background/85 p-0.5 backdrop-blur-sm",
            OVERLAY_CELL.bottomCenter
          )}
          onPointerDown={stopDrag}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={!view}
            onClick={() => zoomBy(1 / ZOOM_STEP)}
          >
            <Minus aria-hidden />
          </Button>
          <span className="min-w-11 text-center font-mono text-xs text-foreground tabular-nums">
            {Math.round((view?.scale ?? 1) * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={!view}
            onClick={() => zoomBy(ZOOM_STEP)}
          >
            <Plus aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="font-mono"
            aria-label="Actual size"
            disabled={!view}
            onClick={actualSize}
          >
            1:1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="font-mono"
            aria-label="Fit to screen"
            disabled={!view}
            onClick={fit}
          >
            Fit
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
            aria-pressed={fullscreen}
            onClick={onToggleFullscreen}
          >
            {fullscreen ? <Minimize aria-hidden /> : <Maximize aria-hidden />}
          </Button>
        </div>
      </div>
    </div>
  )
}
