import { AssetWorkspace } from "../_components/asset-workspace"

export default function ImagesPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10">
      <AssetWorkspace categoryId="images" />
    </div>
  )
}
