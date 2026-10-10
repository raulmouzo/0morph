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

/**
 * Most files loaded at once. Every image keeps its file and a decoded
 * thumbnail in memory, so an unbounded batch could exhaust the tab.
 */
export const MAX_ASSETS = 20

export type Asset = {
  id: string
  file: File
  previewUrl: string
}

type AssetContextValue = {
  assets: Asset[]
  /** Changes when the list is replaced, not when files are added to it. */
  sessionId: number
  /** Files left out of the last import or addition by `MAX_ASSETS`. */
  skipped: number
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
  const [skipped, setSkipped] = useState(0)
  // Mirrors `assets` synchronously, so additions in quick succession (e.g.
  // a paste right after a drop) all see the room that's left.
  const latest = useRef<Asset[]>([])
  const commit = useCallback((next: Asset[]) => {
    latest.current = next
    setAssets(next)
  }, [])

  // Revoke the preview URL of every asset that left the list.
  const previous = useRef<Asset[]>([])
  useEffect(() => {
    const current = new Set(assets.map((asset) => asset.previewUrl))
    for (const asset of previous.current) {
      if (!current.has(asset.previewUrl)) URL.revokeObjectURL(asset.previewUrl)
    }
    previous.current = assets
  }, [assets])

  const replaceAssets = useCallback(
    (files: File[]) => {
      commit(toAssets(files.slice(0, MAX_ASSETS)))
      setSkipped(Math.max(0, files.length - MAX_ASSETS))
      setSessionId((id) => id + 1)
    },
    [commit]
  )

  const addAssets = useCallback(
    (files: File[]) => {
      const room = MAX_ASSETS - latest.current.length
      const accepted = files.slice(0, Math.max(0, room))
      commit([...latest.current, ...toAssets(accepted)])
      setSkipped(files.length - accepted.length)
    },
    [commit]
  )

  const removeAsset = useCallback(
    (id: string) => {
      commit(latest.current.filter((asset) => asset.id !== id))
      setSkipped(0)
    },
    [commit]
  )

  const clearAssets = useCallback(() => {
    commit([])
    setSkipped(0)
  }, [commit])

  const value = useMemo(
    () => ({
      assets,
      sessionId,
      skipped,
      replaceAssets,
      addAssets,
      removeAsset,
      clearAssets,
    }),
    [
      assets,
      sessionId,
      skipped,
      replaceAssets,
      addAssets,
      removeAsset,
      clearAssets,
    ]
  )

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
}

export function useAsset() {
  const ctx = useContext(AssetContext)
  if (!ctx) throw new Error("useAsset must be used within AssetProvider")
  return ctx
}
