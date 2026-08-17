import { Artboard } from "@/components/artboard"
import { ImportDropzone } from "@/components/import-dropzone"
import { AppMenu } from "./_components/apps-menu"
import Hero from "./_components/hero"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10">
      <Hero />
      <Artboard className="align-center mx-auto flex h-full w-full max-w-4xl">
        <div className="flex h-full w-full items-center justify-center align-middle">
          <ImportDropzone />
        </div>
      </Artboard>
      <div className="flex w-full max-w-4xl items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Or go your own way
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <AppMenu className="mx-auto w-full" />
    </div>
  )
}
