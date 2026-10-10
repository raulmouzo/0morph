"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

export type Asset = {
  id: string
  file: File
  previewUrl: string
}

type AssetContextValue = {
  assets: Asset[]
  /** Changes when the list is replaced, not when files are added to it. */
  sessionId: number
  replaceAssets: (files: File[]) => void
  addAssets: (files: File[]) => void
  removeAsset: (id: string) => void
  clearAssets: () => void
}

const AssetContext = createContext<AssetContextValue | null>(null)

const toAssets = (files: File[]): Asset[] =>
  files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
  }))

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [sessionId, setSessionId] = useState(0)

  // Revoke the preview URL of every asset that left the list.
  const previous = useRef<Asset[]>([])
  useEffect(() => {
    const current = new Set(assets.map((asset) => asset.previewUrl))
    for (const asset of previous.current) {
      if (!current.has(asset.previewUrl)) URL.revokeObjectURL(asset.previewUrl)
    }
    previous.current = assets
  }, [assets])

  const replaceAssets = useCallback((files: File[]) => {
    setAssets(toAssets(files))
    setSessionId((id) => id + 1)
  }, [])

  const addAssets = useCallback((files: File[]) => {
    const added = toAssets(files)
    setAssets((current) => [...current, ...added])
  }, [])

  const removeAsset = useCallback((id: string) => {
    setAssets((current) => current.filter((asset) => asset.id !== id))
  }, [])

  const clearAssets = useCallback(() => setAssets([]), [])

  const value = useMemo(
    () => ({
      assets,
      sessionId,
      replaceAssets,
      addAssets,
      removeAsset,
      clearAssets,
    }),
    [assets, sessionId, replaceAssets, addAssets, removeAsset, clearAssets]
  )

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
}

export function useAsset() {
  const ctx = useContext(AssetContext)
  if (!ctx) throw new Error("useAsset must be used within AssetProvider")
  return ctx
}
