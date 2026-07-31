import Image from "next/image"

import { NotFoundGrid } from "./_components/not-found-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MoveLeft } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden bg-[#558467] px-6 text-center">
      <Image
        src="/icons/404/0.svg"
        alt=""
        width={629}
        height={1116}
        className="pointer-events-none absolute -top-40 -left-5 h-100 w-auto -translate-x-1/3 -translate-y-1/3 animate-in transition-all duration-1500 fill-mode-both slide-in-from-top-40 sm:-top-20 lg:left-20 xl:left-40"
      />
      <Image
        src="/icons/404/0.svg"
        alt=""
        width={629}
        height={1116}
        className="pointer-events-none absolute -right-5 -bottom-40 h-100 w-auto translate-x-1/3 translate-y-1/3 animate-in transition-all duration-1500 fill-mode-both slide-in-from-bottom-40 sm:-bottom-20 lg:right-20 xl:right-40"
      />
      <div className="m-auto flex flex-col items-center gap-7 sm:max-w-md sm:gap-15 md:max-w-4xl">
        <NotFoundGrid className="m-auto w-full max-w-xs sm:max-w-xl sm:-translate-x-1 md:max-w-sm lg:max-w-md" />
        <div className="flex flex-col items-center gap-10 text-center sm:gap-5">
          <div className="flex flex-col items-center sm:gap-5">
            <h1 className="font-heading text-2xl font-bold text-[#17433f] sm:text-5xl">
              I&apos;d swear that tool doesn&apos;t exist
            </h1>
            <p className="font-heading text-xl text-white sm:text-3xl">
              and I&apos;m usually right
            </p>
          </div>

          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/" />}
            className="flex items-center justify-center gap-2 bg-transparent px-10 py-6 text-secondary hover:bg-transparent"
          >
            <MoveLeft className="size-6" />
            <span className="text-2xl">Back to home</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
