import localFont from "next/font/local"
import { Space_Mono } from "next/font/google"
import { Suspense } from "react"

import "./globals.css"
import { AssetProvider } from "@/components/asset-provider"
import { StatusBar } from "@/components/status-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
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
            <AssetProvider>
              <div className="mx-auto flex min-h-screen max-w-4xl flex-col">
                <Suspense fallback={<div className="h-9 w-full" />}>
                  <StatusBar />
                </Suspense>
                <div className="flex-1 px-4 sm:px-0">{children}</div>
              </div>
            </AssetProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
