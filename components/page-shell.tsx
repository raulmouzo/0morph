import { ArrowUpRight } from "lucide-react"
import { Suspense } from "react"

import { StatusBar } from "@/components/status-bar"
import { AUTHOR } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * Page frame with the status bar. The site's pages use the default narrow
 * column; tools that need room (the image editor) use "wide".
 */
export function PageShell({
  width = "default",
  children,
}: {
  width?: "default" | "wide"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-screen w-full flex-col",
        width === "default" ? "max-w-4xl" : "max-w-[100rem]"
      )}
    >
      <Suspense fallback={<div className="h-9 w-full" />}>
        <StatusBar />
      </Suspense>
      <div className={cn("flex-1 px-4", width === "default" && "sm:px-0")}>
        {children}
      </div>
      <footer className="flex h-12 items-center justify-center px-4 font-mono text-xs text-muted-foreground">
        <a
          href={AUTHOR.url}
          target="_blank"
          rel="author noreferrer"
          className="group flex items-center gap-1 rounded-sm p-2 transition-colors hover:bg-foreground/10 hover:text-foreground dark:hover:bg-muted/25"
        >
          Made by <span className="font-bold">{AUTHOR.name}</span>
          <ArrowUpRight
            className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </a>
      </footer>
    </div>
  )
}
