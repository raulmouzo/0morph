"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const COLS = 11
const ROWS = 5
const ICON_COUNT = 10
const TICK_SECONDS = 1
const CHANGES_PER_TICK = 2
const REVEAL_ICON_DELAY_SECONDS = 0.03

// 0 = empty cell, 1 = filled cell (icon randomized on mount, see below)
const SHAPE: number[][] = [
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
  [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
  [0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1],
]

function neighborsOf(grid: number[][], y: number, x: number) {
  return [
    grid[y - 1]?.[x],
    grid[y + 1]?.[x],
    grid[y]?.[x - 1],
    grid[y]?.[x + 1],
  ].filter((value): value is number => Boolean(value))
}

// Picks an icon different from the cell's current value and, when possible,
// from its filled neighbors too (falls back to "just different from itself").
function pickIcon(grid: number[][], y: number, x: number) {
  const forbidden = new Set(neighborsOf(grid, y, x))
  forbidden.add(grid[y][x])

  const candidates = Array.from({ length: ICON_COUNT }, (_, i) => i + 1).filter(
    (icon) => !forbidden.has(icon)
  )
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  const fallback = Array.from({ length: ICON_COUNT }, (_, i) => i + 1).filter(
    (icon) => icon !== grid[y][x]
  )
  return fallback.length > 0
    ? fallback[Math.floor(Math.random() * fallback.length)]
    : grid[y][x]
}

const EMPTY_CELLS = SHAPE.map((row) => row.map(() => 0))

const FILLED_POSITIONS: [number, number][] = SHAPE.flatMap((row, y) =>
  row.flatMap((filled, x) => (filled ? [[y, x] as [number, number]] : []))
)

function cycleCells(current: number[][]) {
  const filled: [number, number][] = []
  current.forEach((row, y) =>
    row.forEach((icon, x) => {
      if (icon > 0) filled.push([y, x])
    })
  )
  if (filled.length === 0) return current

  const next = current.map((row) => [...row])
  for (let i = 0; i < CHANGES_PER_TICK; i++) {
    const [y, x] = filled[Math.floor(Math.random() * filled.length)]
    next[y][x] = pickIcon(next, y, x)
  }
  return next
}

export function NotFoundGrid({ className }: { className?: string }) {
  const [cells, setCells] = useState<number[][]>(EMPTY_CELLS)

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    let interval: ReturnType<typeof setInterval> | undefined

    // Reveal icon by icon, top to bottom / left to right, then start the random cycling.
    FILLED_POSITIONS.forEach(([y, x], i) => {
      timeouts.push(
        setTimeout(
          () => {
            setCells((current) => {
              const next = current.map((r) => [...r])
              next[y][x] = pickIcon(next, y, x)
              return next
            })

            if (i === FILLED_POSITIONS.length - 1) {
              interval = setInterval(() => {
                setCells(cycleCells)
              }, TICK_SECONDS * 1000)
            }
          },
          i * REVEAL_ICON_DELAY_SECONDS * 1000
        )
      )
    })

    return () => {
      timeouts.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
    >
      {cells.flatMap((row, y) =>
        row.map((icon, x) => (
          <div key={`${x}-${y}`} className="aspect-square p-0.5">
            {icon > 0 && (
              <>
                <Image
                  src={`/icons/404/${icon}.svg`}
                  alt=""
                  width={69}
                  height={69}
                  className="size-full dark:hidden"
                />
                <Image
                  src={`/icons/404/${icon}-dark.svg`}
                  alt=""
                  width={69}
                  height={69}
                  className="hidden size-full dark:block"
                />
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
}
