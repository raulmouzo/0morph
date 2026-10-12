import Image from "next/image"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getLastCommit } from "@/lib/git"
import { cn } from "@/lib/utils"
import { A_CORUNA, getWeather } from "@/lib/weather"

export async function StatusBar() {
  const [weather, commit] = await Promise.all([
    getWeather(A_CORUNA),
    getLastCommit(),
  ])

  return (
    <div className="flex h-9 w-full items-center justify-between px-4 font-mono text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          aria-label="0morph, home"
          className="flex gap-2 rounded-sm p-2 transition-colors hover:bg-foreground/10 dark:hover:bg-muted/25 dark:hover:brightness-150"
        >
          <Image
            src="/icons/isotype.svg"
            alt=""
            width={32}
            height={32}
            className="dark:hidden"
          />
          <Image
            src="/icons/isotype-dark.svg"
            alt=""
            width={32}
            height={32}
            className="hidden dark:block"
          />
          <span className="font-bold">0morph</span>
        </Link>

        {weather && (
          <div className="flex gap-2 rounded-sm p-2 transition-colors hover:bg-foreground/10 dark:hover:bg-muted/25 dark:hover:brightness-150">
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="flex items-center gap-1.5 text-foreground" />
                }
              >
                <weather.Icon className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{weather.description}, </span>A Coruña{" "}
                {weather.temperatureC}°C
              </TooltipTrigger>
              <TooltipContent>{weather.description}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {commit && (
          <div className="hidden gap-1.5 rounded-sm p-2 transition-colors hover:bg-foreground/10 md:flex dark:hover:bg-muted/25 dark:hover:brightness-150">
            <span className="text-foreground">{commit.hash}</span>
            <span>·</span>
            <span className="text-destructive">-{commit.deletions}</span>
            <span className="text-emerald-500">+{commit.insertions}</span>
            <span>·</span>
            <span>Last commit {commit.relativeTime}</span>
          </div>
        )}

        <ThemeToggle className="rounded-sm p-2 transition-colors hover:bg-foreground/10 dark:hover:bg-muted/25 dark:hover:brightness-150" />
      </div>
    </div>
  )
}

/** Stand-in while the weather and the last commit load. */
export function StatusBarSkeleton() {
  const bar = "h-4 animate-pulse rounded-sm bg-foreground/10"
  return (
    <div
      aria-hidden
      className="flex h-9 w-full items-center justify-between px-4 select-none"
    >
      <div className="flex items-center gap-4 p-2">
        <div className={cn(bar, "w-24")} />
        <div className={cn(bar, "w-28")} />
      </div>
      <div className="flex items-center gap-4 p-2">
        <div className={cn(bar, "hidden w-56 md:block")} />
        <div className={cn(bar, "size-4")} />
      </div>
    </div>
  )
}
