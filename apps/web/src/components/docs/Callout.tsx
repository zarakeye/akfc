import type { ReactNode } from "react"

export function Callout({
  title = "Note",
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div className="my-6 rounded-2xl border px-4 py-4">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="text-sm leading-6 text-muted-foreground">{children}</div>
    </div>
  )
}
