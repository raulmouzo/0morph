import Image from "next/image"

import { NotFoundGrid } from "./_components/not-found-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MoveLeft } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="fixed inset-x-0 top-9 bottom-0 flex items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-5 -z-10 animate-in slide-in-from-top-40 fill-mode-both transition-all duration-1500 sm:-top-20 lg:left-20 xl:left-40">
        <div className="animate-float">
          <Image
            src="/icons/404/0.svg"
            alt=""
            width={629}
            height={1116}
            className="h-100 w-auto -translate-x-1/3 -translate-y-1/3 dark:hidden"
          />
          <Image
            src="/icons/404/0-dark.svg"
            alt=""
            width={629}
            height={1116}
            className="hidden h-100 w-auto -translate-x-1/3 -translate-y-1/3 dark:block"
          />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-5 -bottom-40 -z-10 animate-in slide-in-from-bottom-40 fill-mode-both transition-all duration-1500 sm:-bottom-20 lg:right-20 xl:right-40">
        <div className="animate-float">
          <Image
            src="/icons/404/0.svg"
            alt=""
            width={629}
            height={1116}
            className="h-100 w-auto translate-x-1/3 translate-y-1/3 dark:hidden"
          />
          <Image
            src="/icons/404/0-dark.svg"
            alt=""
            width={629}
            height={1116}
            className="hidden h-100 w-auto translate-x-1/3 translate-y-1/3 dark:block"
          />
        </div>
      </div>
      <div className="m-auto flex flex-col items-center gap-7 sm:max-w-md sm:gap-15 md:max-w-4xl">
        <NotFoundGrid className="m-auto w-full max-w-xs sm:max-w-xl sm:-translate-x-1 md:max-w-sm lg:max-w-md" />
        <div className="flex flex-col items-center gap-10 text-center sm:gap-5">
          <div className="flex flex-col items-center sm:gap-5">
            <h1 className="font-heading text-2xl font-bold text-foreground sm:text-5xl">
              I&apos;d swear that tool doesn&apos;t exist
            </h1>
            <p className="font-heading text-xl text-muted-foreground sm:text-3xl">
              and I&apos;m usually right
            </p>
          </div>

          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/" />}
            className="flex items-center justify-center gap-2 bg-transparent px-10 py-6 text-muted-foreground hover:bg-transparent"
          >
            <MoveLeft className="size-6" />
            <span className="text-2xl">Back to home</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
