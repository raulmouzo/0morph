import { AssetWorkspace } from "../_components/asset-workspace"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function AudioPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10">
      <AssetWorkspace categoryId="audio" />
    </div>
  )
}
