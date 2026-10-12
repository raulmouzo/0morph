import { ArrowUpRight } from "lucide-react"
import { Suspense } from "react"

import { StatusBar, StatusBarSkeleton } from "@/components/status-bar"
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
        // The default column is 56rem (max-w-4xl) of content plus the side
        // padding, so it never touches the screen edges.
        width === "default" ? "max-w-[calc(56rem+3rem)]" : "max-w-[100rem]"
      )}
    >
      <Suspense fallback={<StatusBarSkeleton />}>
        <StatusBar />
      </Suspense>
      <div className="flex-1 px-4 sm:px-6">{children}</div>
      {/* Left out of the wide tools, where it would cover their controls. */}
      {width === "default" && (
        <a
          href={AUTHOR.url}
          target="_blank"
          rel="author noreferrer"
          className="group fixed right-4 bottom-4 z-40 flex animate-in items-center gap-1.5 rounded-full border border-border bg-background/85 px-4 py-2 font-mono text-xs text-muted-foreground shadow-sm backdrop-blur-sm transition-colors fade-in slide-in-from-bottom-2 hover:text-foreground"
        >
          Discover more apps
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </a>
      )}
    </div>
  )
}
