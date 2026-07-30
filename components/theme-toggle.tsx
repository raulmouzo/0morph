"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useMounted } from "@/hooks/use-mounted"

export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useMounted()
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      className={className}
      variant="ghost"
      size="icon-lg"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
