"use client"

import { useTheme } from "next-themes"
import { useState } from "react"

import { FaultyTerminal } from "@/components/ui/faulty-terminal"
import { cn } from "@/lib/utils"
import { useMounted } from "@/hooks/use-mounted"

const TINT = {
  light: "#334b48",
  dark: "#558467",
}

const BG = {
  light: "#96b1ad",
  dark: "#081212",
}

export function HeroPill({ className }: { className?: string }) {
  const mounted = useMounted()
  const [ready, setReady] = useState(false)
  const { resolvedTheme } = useTheme()
  const darkMode = mounted && resolvedTheme === "dark"
  const tint = darkMode ? TINT.dark : TINT.light

  return (
    <div className={cn("relative overflow-hidden rounded-full", className)}>
      {/* Skeleton until the WebGL terminal draws its first frame (it starts
          after hydration, once the theme is known), then cross-fades. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 animate-pulse bg-foreground/10 transition-opacity duration-700",
          ready && "opacity-0"
        )}
      />
      {mounted && (
        <FaultyTerminal
          className={cn(
            "transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0"
          )}
          onReady={() => setReady(true)}
          scale={1}
          gridMul={[2, 1]}
          digitSize={1}
          timeScale={1}
          pause={false}
          scanlineIntensity={0}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          mouseReact
          mouseStrength={0.5}
          pageLoadAnimation
          brightness={1}
          backgroundColor={darkMode ? BG.dark : BG.light}
          tint={tint}
        />
      )}
    </div>
  )
}
