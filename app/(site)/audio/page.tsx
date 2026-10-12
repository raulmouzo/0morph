import type { Metadata } from "next"

import { AssetWorkspace } from "../../_components/asset-workspace"

// Not released yet: kept out of search results until it is.
export const metadata: Metadata = {
  title: "Audio",
  robots: { index: false },
}

export default function AudioPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10">
      <AssetWorkspace categoryId="audio" />
    </div>
  )
}
