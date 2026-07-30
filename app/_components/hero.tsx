"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { HeroPill } from "./hero-pill"
import { useMounted } from "@/hooks/use-mounted"

const PLACEHOLDER_SRC =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

function HeroImage({ className }: { className?: string }) {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()

  let src = PLACEHOLDER_SRC

  if (mounted) {
    if (resolvedTheme === "dark") {
      src = "/images/apps-hero-dark.svg"
    } else if (resolvedTheme === "light") {
      src = "/images/apps-hero.svg"
    }
  }

  return (
    <Image
      src={src}
      width={1132}
      height={321}
      alt="Apps hero image"
      loading="eager"
      className={className}
    />
  )
}

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-full py-10">
        <div className="flex aspect-1619/321 w-full items-center gap-x-[2.53%]">
          <HeroPill className="aspect-446/221 w-[27.55%]" />
          <HeroImage className="h-full flex-1" />
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground uppercase">
          No uploads. <span className="font-bold">No accounts.</span> No servers
          watching over your shoulder.
          <br />
          Just fast, <span className="font-bold">private</span> tools that run
          entirely in your browser.
        </p>
        <Button
          className="flex flex-1 transform items-center justify-center gap-2 rounded-full p-8 font-heading text-2xl"
          nativeButton={false}
          render={
            <a
              href="https://github.com/raulmouzo/0morph"
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <span>Go to GitHub</span>
        </Button>
      </div>
    </div>
  )
}
