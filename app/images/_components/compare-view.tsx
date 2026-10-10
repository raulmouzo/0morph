import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider"

/**
 * Before/after split between the original and the output. Only the handle
 * moves the divider, so dragging the image pans the canvas instead. The
 * description of each side lives on the canvas (see ImageStats).
 */
export function CompareView({
  before,
  after,
  alt,
}: {
  before: string
  after: string
  alt: string
}) {
  return (
    <ReactCompareSlider
      className="size-full"
      onlyHandleDraggable
      itemOne={<ReactCompareSliderImage src={before} alt={`${alt}, before`} />}
      itemTwo={<ReactCompareSliderImage src={after} alt={`${alt}, after`} />}
    />
  )
}
