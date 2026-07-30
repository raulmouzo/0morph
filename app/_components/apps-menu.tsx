import { ArrowUpRight } from "lucide-react"
import type { ComponentType, SVGProps } from "react"

import { AudioIcon, ImagesIcon, VideoIcon } from "@/components/icons/app-icons"
import { cn } from "@/lib/utils"

const categories: {
  href: string
  label: string
  index: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  glow: string
  tools: { label: string; href: string }[]
}[] = [
  {
    href: "",
    label: "images",
    index: "01",
    icon: ImagesIcon,
    glow: "bg-accent/50",
    tools: [
      { label: "Converter", href: "/converter" },
      { label: "Compressor", href: "/compressor" },
      { label: "Resizer", href: "/resizer" },
    ],
  },
  {
    href: "",
    label: "video",
    index: "02",
    icon: VideoIcon,
    glow: "bg-secondary/20",
    tools: [
      { label: "Converter", href: "/converter" },
      { label: "Compressor", href: "/compressor" },
      { label: "Trimmer", href: "/trimmer" },
    ],
  },
  {
    href: "",
    label: "audio",
    index: "03",
    icon: AudioIcon,
    glow: "bg-primary/25",
    tools: [
      { label: "Converter", href: "/converter" },
      { label: "Compressor", href: "/compressor" },
      { label: "Transcriber", href: "/transcriber" },
    ],
  },
]

export function AppMenu({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 md:h-112 md:flex-row", className)}>
      {categories.map(({ href, label, index, icon: Icon, glow, tools }) => (
        <div
          key={label}
          className="group/card relative min-w-0 md:flex-1 md:basis-0 md:transition-[flex-grow] md:duration-500 md:ease-out md:hover:flex-[2.6]"
        >
          <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 transition-colors duration-300 group-hover/card:border-primary/40">
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl transition-transform duration-500 ease-out group-hover/card:scale-125",
                glow
              )}
            />

            <span className="relative font-mono text-[0.65rem] text-muted-foreground/60">
              {index}
            </span>

            {/* Mobile: always-expanded layout */}
            <div className="relative flex flex-1 flex-col pt-4 pb-5 md:hidden">
              <div className="flex items-center gap-3">
                <Icon className="size-10 shrink-0 text-primary" />
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-heading text-xl text-foreground"
                >
                  <span className="text-muted-foreground/70">.</span>
                  {label}
                </a>
              </div>
              <ul className="flex flex-col gap-1">
                {tools.map((tool) => (
                  <li key={tool.href}>
                    <a
                      href={tool.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group/tool flex items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      {tool.label}
                      <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover/tool:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop: idle centered icon, crossfades to expanded panel on hover */}
            <div className="relative hidden flex-1 md:block">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pt-4 pb-5 transition-all duration-300 ease-out group-hover/card:pointer-events-none group-hover/card:-translate-y-2 group-hover/card:opacity-0">
                <Icon className="size-16 text-primary transition-transform duration-500 ease-out lg:size-20" />
                <span className="flex items-baseline gap-1 font-heading text-lg text-foreground/70">
                  <span className="text-muted-foreground/70">.</span>
                  {label}
                </span>
              </div>

              <div className="absolute inset-0 flex translate-y-2 flex-col opacity-0 transition-all duration-300 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100">
                <div className="flex items-center gap-2.5 pb-4">
                  <Icon className="size-8 shrink-0 text-primary" />
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-baseline gap-1 font-heading text-xl text-foreground hover:text-primary"
                  >
                    <span className="text-muted-foreground/70">.</span>
                    {label}
                  </a>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
                <ul className="flex min-w-0 flex-col gap-1">
                  {tools.map((tool, i) => (
                    <li
                      key={tool.href}
                      className="translate-y-1 opacity-0 transition-all duration-300 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100"
                      style={{ transitionDelay: `${i * 60 + 80}ms` }}
                    >
                      <a
                        href={tool.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group/tool flex items-center justify-between gap-2 truncate rounded-xl px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      >
                        {tool.label}
                        <ArrowUpRight className="size-3.5 shrink-0 -translate-x-1 opacity-0 transition-all group-hover/tool:translate-x-0 group-hover/tool:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
