"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Resizable } from "re-resizable"

const handleleSize = "w-2 h-2"
const handleStyle = "border-2 border-primary bg-background"
const handleCenterClass = "flex! items-center justify-center"

function ArtboardChrome() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 border-[2] border-primary/90" />
      <div className="pointer-events-none absolute inset-2 border-[1.5] border-dashed border-gray-400/40" />
    </>
  )
}

export const Artboard = ({
  children,
  className = "",
  resizable = false,
}: {
  children: React.ReactNode
  className?: string
  resizable?: boolean
}) => {
  const handle = <div className={`${handleleSize} ${handleStyle}`} />
  const contentRef = useRef<HTMLDivElement>(null)
  const [minSize, setMinSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (!resizable) return
    const node = contentRef.current
    if (!node) return

    const measure = () => {
      const previousWidth = node.style.width
      node.style.width = "max-content"
      const { width, height } = node.getBoundingClientRect()
      node.style.width = previousWidth
      setMinSize({ width: Math.ceil(width), height: Math.ceil(height) })
    }

    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [resizable])

  if (resizable) {
    return (
      <Resizable
        className={`relative w-full ${className}`}
        defaultSize={{ width: "100%", height: "auto" }}
        minWidth={minSize.width}
        minHeight={minSize.height}
        handleClasses={{
          top: handleCenterClass,
          right: handleCenterClass,
          bottom: handleCenterClass,
          left: handleCenterClass,
          topLeft: handleCenterClass,
          topRight: handleCenterClass,
          bottomLeft: handleCenterClass,
          bottomRight: handleCenterClass,
        }}
        handleComponent={{
          top: handle,
          right: handle,
          bottom: handle,
          left: handle,
          topLeft: handle,
          topRight: handle,
          bottomLeft: handle,
          bottomRight: handle,
        }}
      >
        <ArtboardChrome />
        <div ref={contentRef} className="p-1">
          {children}
        </div>
      </Resizable>
    )
  }

  return (
    <div className={`relative w-full ${className}`}>
      <ArtboardChrome />

      {/* Esquinas */}
      <div
        className={`absolute -top-0.75 -left-0.75 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute -top-0.75 -right-0.75 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute -bottom-0.75 -left-0.75 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute -right-0.75 -bottom-0.75 ${handleleSize} ${handleStyle}`}
      />

      {/* Puntos medios */}
      <div
        className={`absolute -top-0.75 left-1/2 -translate-x-1/2 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute -bottom-0.75 left-1/2 -translate-x-1/2 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute top-1/2 -left-0.75 -translate-y-1/2 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute top-1/2 -right-0.75 -translate-y-1/2 ${handleleSize} ${handleStyle}`}
      />

      {/* Contenido */}
      <div className="p-1">{children}</div>
    </div>
  )
}
