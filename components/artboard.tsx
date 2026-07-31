const handleleSize = "w-2 h-2"
const handleStyle = "border-2 border-primary bg-background"

export const Artboard = ({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Borde sólido exterior */}
      <div className="pointer-events-none absolute inset-0 border-[2] border-primary/90" />

      {/* Borde punteado interior */}
      <div className="pointer-events-none absolute inset-2 border-[1.5] border-dashed border-gray-400/40" />

      {/* Esquinas */}
      <div
        className={`absolute -top-0.75 -left-0.75 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute -top-0.75 -right-0.75 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute -bottom-0.75 -left-0.75 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute -right-0.75 -bottom-0.75 ${handleleSize} ${handleStyle}`}
      />

      {/* Puntos medios */}
      <div
        className={`absolute -top-0.75 left-1/2 -translate-x-1/2 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute -bottom-0.75 left-1/2 -translate-x-1/2 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute top-1/2 -left-0.75 -translate-y-1/2 ${handleleSize} ${handleStyle}`}
      />
      <div
        className={`absolute top-1/2 -right-0.75 -translate-y-1/2 ${handleleSize} ${handleStyle}`}
      />

      {/* Contenido */}
      <div className="h-full w-full p-1">{children}</div>
    </div>
  )
}
