"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

type AssetContextValue = {
  file: File | null
  previewUrl: string | null
  setAsset: (file: File) => void
  clearAsset: () => void
}

const AssetContext = createContext<AssetContextValue | null>(null)

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const setAsset = useCallback((next: File) => {
    setFile(next)
    setPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl)
      return URL.createObjectURL(next)
    })
  }, [])

  const clearAsset = useCallback(() => {
    setFile(null)
    setPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl)
      return null
    })
  }, [])

  const value = useMemo(
    () => ({ file, previewUrl, setAsset, clearAsset }),
    [file, previewUrl, setAsset, clearAsset]
  )

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
}

export function useAsset() {
  const ctx = useContext(AssetContext)
  if (!ctx) throw new Error("useAsset must be used within AssetProvider")
  return ctx
}
