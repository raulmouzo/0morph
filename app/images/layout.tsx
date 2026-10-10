import { PageShell } from "@/components/page-shell"

export default function ImagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <PageShell width="wide">{children}</PageShell>
}
