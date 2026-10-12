import type { Metadata } from "next"

import { AssetWorkspace } from "../../_components/asset-workspace"

// Not released yet: kept out of search results until it is.
export const metadata: Metadata = {
  title: "Video",
  robots: { index: false },
}

export default function VideoPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10">
      <AssetWorkspace categoryId="video" />
    </div>
  )
}
