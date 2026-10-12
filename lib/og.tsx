import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { cacheLife } from "next/cache"
import { ImageResponse } from "next/og"

import { BRAND } from "@/lib/site"

/** Open Graph card size, shared by every route's `opengraph-image`. */
export const OG_SIZE = { width: 1200, height: 630 }

// Satori can't read variable fonts, so the cards use static instances of
// Nohemi cut from app/fonts/Nohemi-VF.ttf. Cached so the file reads don't
// stop the cards from being prerendered.
async function loadFontFiles() {
  "use cache"
  cacheLife("max")
  const dir = join(process.cwd(), "app/fonts/og")
  const [regular, bold] = await Promise.all([
    readFile(join(dir, "Nohemi-400.ttf")),
    readFile(join(dir, "Nohemi-700.ttf")),
  ])
  return { regular: new Uint8Array(regular), bold: new Uint8Array(bold) }
}

async function loadFonts() {
  const { regular, bold } = await loadFontFiles()
  return [
    { name: "Nohemi", data: regular.buffer, weight: 400 as const },
    { name: "Nohemi", data: bold.buffer, weight: 700 as const },
  ]
}

/**
 * The site's share card: the hero's pill-and-word lockup, with the brand
 * along the top and a one-line tagline underneath.
 */
export async function renderOgImage({
  word,
  tagline,
}: {
  word: string
  tagline: string
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 72px",
        backgroundColor: BRAND.paper,
        color: BRAND.ink,
        fontFamily: "Nohemi",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30 }}
      >
        <div
          style={{
            width: 52,
            height: 26,
            borderRadius: 999,
            backgroundColor: BRAND.ink,
          }}
        />
        <span style={{ fontWeight: 700 }}>0morph</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div
          style={{
            width: 300,
            height: 149,
            borderRadius: 999,
            backgroundImage: `linear-gradient(120deg, ${BRAND.ink}, ${BRAND.green})`,
          }}
        />
        <span
          style={{
            fontSize: 196,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            // Nohemi's caps sit high in the em box.
            marginTop: 24,
          }}
        >
          {word}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 28,
          color: BRAND.muted,
        }}
      >
        <span>{tagline}</span>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>
          Runs in your browser
        </span>
      </div>
    </div>,
    { ...OG_SIZE, fonts: await loadFonts() }
  )
}
