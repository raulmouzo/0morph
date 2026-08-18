import Image from "next/image"

import { NotFoundGrid } from "./_components/not-found-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MoveLeft } from "lucide-react"

export default function NotFoundPage() {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-9 bottom-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-3 animate-in slide-in-from-top-40 fill-mode-both transition-all duration-1500 sm:-top-40 sm:-left-5 md:-top-20 lg:left-20 xl:left-40">
          <div className="animate-float">
            <Image
              src="/icons/404/0.svg"
              alt=""
              width={629}
              height={1116}
              className="h-56 w-auto -translate-x-1/3 -translate-y-1/3 dark:hidden sm:h-100"
            />
            <Image
              src="/icons/404/0-dark.svg"
              alt=""
              width={629}
              height={1116}
              className="hidden h-56 w-auto -translate-x-1/3 -translate-y-1/3 dark:block sm:h-100"
            />
          </div>
        </div>
        <div className="absolute -right-3 -bottom-24 animate-in slide-in-from-bottom-40 fill-mode-both transition-all duration-1500 sm:-right-5 sm:-bottom-40 md:-bottom-20 lg:right-20 xl:right-40">
          <div className="animate-float">
            <Image
              src="/icons/404/0.svg"
              alt=""
              width={629}
              height={1116}
              className="h-56 w-auto translate-x-1/3 translate-y-1/3 dark:hidden sm:h-100"
            />
            <Image
              src="/icons/404/0-dark.svg"
              alt=""
              width={629}
              height={1116}
              className="hidden h-56 w-auto translate-x-1/3 translate-y-1/3 dark:block sm:h-100"
            />
          </div>
        </div>
      </div>
      <div className="flex min-h-[calc(100dvh-2.25rem)] items-center justify-center">
        <div className="m-auto flex flex-col items-center gap-4 px-6 sm:max-w-md sm:gap-15 sm:px-0 md:max-w-4xl">
          <NotFoundGrid className="m-auto w-full max-w-44 -translate-x-1 sm:max-w-xl md:max-w-sm lg:max-w-md" />
          <div className="flex flex-col items-center gap-5 text-center sm:gap-5">
            <div className="flex flex-col items-center gap-1 sm:gap-5">
              <h1 className="font-heading text-lg font-bold text-foreground sm:text-5xl">
                I&apos;d swear that tool doesn&apos;t exist
              </h1>
              <p className="font-heading text-sm text-muted-foreground sm:text-3xl">
                and I&apos;m usually right
              </p>
            </div>

            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/" />}
              className="flex items-center justify-center gap-2 bg-transparent px-4 py-3 text-muted-foreground hover:bg-transparent sm:px-10 sm:py-6"
            >
              <MoveLeft className="size-4 sm:size-6" />
              <span className="text-sm sm:text-2xl">Back to home</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
