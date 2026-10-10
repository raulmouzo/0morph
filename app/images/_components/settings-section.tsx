import { useId } from "react"

export function SettingsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2
        id={id}
        className="font-mono text-xs font-bold text-muted-foreground uppercase"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}
