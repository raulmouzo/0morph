import Image from "next/image"

import { Button } from "@/components/ui/button"

import { HeroPill } from "./hero-pill"

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-full py-10">
        <div className="flex aspect-1619/321 w-full items-center gap-x-[2.53%]">
          <HeroPill className="aspect-446/221 w-[27.55%]" />
          <Image
            src="/images/apps-hero.svg"
            alt="Apps hero image"
            width={1132}
            height={321}
            className="h-full flex-1 dark:hidden"
          />
          <Image
            src="/images/apps-hero-dark.svg"
            alt="Apps hero image"
            width={1132}
            height={321}
            className="hidden h-full flex-1 dark:block"
          />
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
          render={
            <a
              href="https://github.com/0morph"
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <span className="translate-y-0.5">Go to GitHub</span>
        </Button>
      </div>
    </div>
  )
}
