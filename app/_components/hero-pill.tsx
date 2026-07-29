"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"

import { FaultyTerminal } from "@/components/ui/faulty-terminal"
import { cn } from "@/lib/utils"

const TINT = {
  light: "#cfdad7",
  dark: "#558467",
}

const BG = {
  light: "#17433f",
  dark: "#081212",
}

const FADE_MS = 300
const AUTO_SHOW_MS = 10_000
const AUTO_SHOW_MIN_GAP_MS = 8_000
const AUTO_SHOW_MAX_GAP_MS = 20_000

export function HeroPill({ className }: { className?: string }) {
  const [hovered, setHovered] = useState(false)
  const [autoShow, setAutoShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hoveredRef = useRef(false)
  const autoShowRef = useRef(false)
  const unmountTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === "dark"
  const tint = darkMode ? TINT.dark : TINT.light

  const active = hovered || autoShow

  const syncMounted = () => {
    if (hoveredRef.current || autoShowRef.current) {
      if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current)
      setMounted(true)
    } else {
      unmountTimeoutRef.current = setTimeout(() => setMounted(false), FADE_MS)
    }
  }

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleShow = () => {
      const gap =
        AUTO_SHOW_MIN_GAP_MS +
        Math.random() * (AUTO_SHOW_MAX_GAP_MS - AUTO_SHOW_MIN_GAP_MS)
      timeoutId = setTimeout(() => {
        if (cancelled) return
        autoShowRef.current = true
        setAutoShow(true)
        syncMounted()
        timeoutId = setTimeout(() => {
          if (cancelled) return
          autoShowRef.current = false
          setAutoShow(false)
          syncMounted()
          scheduleShow()
        }, AUTO_SHOW_MS)
      }, gap)
    }

    scheduleShow()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    hoveredRef.current = true
    setHovered(true)
    syncMounted()
  }

  const handleMouseLeave = () => {
    hoveredRef.current = false
    setHovered(false)
    syncMounted()
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "overflow-hidden rounded-full transition-[width,height] duration-500 ease-in-out",
        active ? "bg-transparent" : "bg-primary",
        className
      )}
    >
      {mounted && (
        <FaultyTerminal
          className={cn(
            "transition-opacity ease-out",
            active ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          scale={1.1}
          digitSize={0.9}
          timeScale={0.5}
          noiseAmp={0.5}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint={tint}
          mouseReact
          mouseStrength={0.2}
          pageLoadAnimation
          brightness={1}
          backgroundColor={darkMode ? BG.dark : BG.light}
        />
      )}
    </div>
  )
}
