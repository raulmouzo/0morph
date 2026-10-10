import { PageShell } from "@/components/page-shell"

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <PageShell>{children}</PageShell>
}
