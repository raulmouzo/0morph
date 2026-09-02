import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { ENABLED_CATEGORIES } from "@/lib/categories"
import { cn } from "@/lib/utils"

export function AppMenu({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3", className)}>
      {ENABLED_CATEGORIES.map(({ id, label, href, icon: Icon, glow }, i) => (
        <Link
          key={id}
          href={href}
          className="group/card relative isolate flex flex-row items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card px-5 py-4 transition-colors duration-300 hover:border-primary/40 sm:aspect-square sm:flex-col sm:justify-center sm:gap-3 sm:rounded-3xl sm:p-6"
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl transition-transform duration-500 ease-out group-hover/card:scale-125",
              glow
            )}
          />

          <span className="absolute top-4 left-4 hidden font-mono text-[0.65rem] text-muted-foreground/60 sm:block">
            {String(i + 1).padStart(2, "0")}
          </span>

          <Icon className="relative size-10 shrink-0 text-primary transition-transform duration-300 ease-out group-hover/card:scale-110 sm:size-16 lg:size-20" />
          <span className="relative flex items-center gap-1 font-heading text-lg text-foreground">
            <span className="text-muted-foreground/70">.</span>
            {label}
            <span className="w-0 overflow-hidden transition-all duration-300 ease-out group-hover/card:w-4">
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}
