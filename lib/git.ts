import { execSync } from "node:child_process"

import { connection } from "next/server"

export type LastCommit = {
  hash: string
  insertions: number
  deletions: number
  relativeTime: string
}

function relativeTime(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000))
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Infinity, "year"],
  ]

  let value = seconds
  let unit = "second"
  for (const [amount, name] of units) {
    if (value < amount) {
      unit = name
      break
    }
    value = Math.floor(value / amount)
    unit = name
  }

  const rounded = Math.floor(value)
  if (unit === "second") return "just now"
  return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`
}

export async function getLastCommit(): Promise<LastCommit | null> {
  await connection()

  try {
    const hash = execSync("git rev-parse --short HEAD").toString().trim()
    const isoDate = execSync("git log -1 --format=%cI").toString().trim()
    const shortstat = execSync('git show HEAD --shortstat --format=""').toString()

    const insertions = Number(shortstat.match(/(\d+) insertion/)?.[1] ?? 0)
    const deletions = Number(shortstat.match(/(\d+) deletion/)?.[1] ?? 0)

    return {
      hash,
      insertions,
      deletions,
      relativeTime: relativeTime(new Date(isoDate)),
    }
  } catch {
    return null
  }
}
