import { Artboard } from "@/components/artboard"
import { ImportDropzone } from "@/components/import-dropzone"
import Hero from "./_components/hero"
import { SampleGallery } from "./_components/sample-gallery"

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-4">
      <Hero />
      <Artboard className="align-center mx-auto flex h-full w-full max-w-4xl">
        <div className="flex h-full w-full items-center justify-center align-middle">
          <ImportDropzone />
        </div>
      </Artboard>
      <SampleGallery />
    </div>
  )
}
