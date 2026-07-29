import localFont from "next/font/local"
import { Space_Mono } from "next/font/google"

import "./globals.css"
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
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceMono.variable,
        nohemi.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <div className="mx-auto max-w-4xl">
              <StatusBar />
              <div className="px-4 sm:px-0">{children}</div>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
