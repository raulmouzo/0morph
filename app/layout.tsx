import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Space_Mono } from "next/font/google"

import "./globals.css"
import { AssetProvider } from "@/components/asset-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AUTHOR, SITE } from "@/lib/site"
import { cn } from "@/lib/utils"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
})

const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

const nohemi = localFont({
  src: "./fonts/Nohemi-VF.ttf",
  variable: "--font-heading",
  weight: "100 900",
  declarations: [
    /* limited availability -> Safari */
    { prop: "ascent-override", value: "75%" },
    { prop: "descent-override", value: "10%" },
    { prop: "line-gap-override", value: "7%" },
  ],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "image converter",
    "image compressor",
    "resize image",
    "crop image",
    "webp converter",
    "avif converter",
    "strip exif",
    "batch image editor",
    "private",
    "client-side",
    "no upload",
  ],
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  appleWebApp: { title: SITE.name, statusBarStyle: "default" },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1f1f" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceMono.variable,
        nohemi.variable
      )}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {/* The page frame (PageShell) comes from the (site) and images
                layouts, and from not-found. */}
            <AssetProvider>{children}</AssetProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
