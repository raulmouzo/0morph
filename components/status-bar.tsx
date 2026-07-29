import Image from "next/image"

import { getLastCommit } from "@/lib/git"
import { A_CORUNA, getWeather } from "@/lib/weather"

export async function StatusBar() {
  const [weather, commit] = await Promise.all([getWeather(A_CORUNA), getLastCommit()])

  return (
    <div className="flex h-9 w-full items-center justify-between px-4 font-mono text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <Image src="/icons/isotype.svg" alt="0morph" width={32} height={32} />
        <span>0morph</span>

        {weather && (
          <span className="flex items-center gap-1.5 text-foreground" title={weather.description}>
            <weather.Icon className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{weather.description}, </span>
            A Coruña {weather.temperatureC}°C
          </span>
        )}

      </div>

      {commit && (
        <div className="flex items-center gap-1.5">
          <span className="text-foreground">{commit.hash}</span>
          <span>·</span>
          <span className="text-destructive">-{commit.deletions}</span>
          <span className="text-emerald-500">+{commit.insertions}</span>
          <span>·</span>
          <span>Last commit {commit.relativeTime}</span>
        </div>
      )}
    </div>
  )
}
