import { Suspense } from "react"

import { StatusBar } from "@/components/status-bar"
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
    </div>
  )
}
