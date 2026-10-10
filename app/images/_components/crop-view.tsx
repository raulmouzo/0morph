import "react-image-crop/dist/ReactCrop.css"

import ReactCrop, { type PercentCrop } from "react-image-crop"

/** Interactive crop box over the rotated, uncropped image. */
export function CropView({
  src,
  alt,
  crop,
  aspect,
  onChange,
}: {
  src: string
  alt: string
  crop: PercentCrop
  aspect: number | null
  onChange: (crop: PercentCrop) => void
}) {
  return (
    <ReactCrop
      className="block! size-full"
      crop={crop}
      aspect={aspect ?? undefined}
      keepSelection
      ruleOfThirds
      onChange={(_, percentCrop) => onChange(percentCrop)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block w-full" />
    </ReactCrop>
  )
}
