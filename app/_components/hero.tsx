"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import GithubIcon from "@/components/ui/github-icon"
import type { AnimatedIconHandle } from "@/components/ui/types"
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
  const githubIconRef = useRef<AnimatedIconHandle>(null)

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
          className="group relative flex flex-1 transform items-center justify-center gap-2 rounded-full px-4 py-2 text-lg sm:p-8 sm:font-heading sm:text-2xl"
          nativeButton={false}
          onMouseEnter={() => githubIconRef.current?.startAnimation()}
          onMouseLeave={() => githubIconRef.current?.stopAnimation()}
          render={
            <a
              href="https://github.com/raulmouzo/0morph"
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <span className="transition-opacity duration-200 ease-out group-hover:opacity-0">
            Support on GitHub
          </span>
          <GithubIcon
            ref={githubIconRef}
            className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
          />
        </Button>
      </div>
    </div>
  )
}
