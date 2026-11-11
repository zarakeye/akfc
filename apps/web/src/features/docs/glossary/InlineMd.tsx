import type { ReactNode } from "react"

/** Le peu de mise en forme d'une définition courte : `code`, **gras**, *italique*. */
export function InlineMd({ text }: { text: string }) {
  const parts: ReactNode[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let cursor = 0
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0
    if (at > cursor) parts.push(text.slice(cursor, at))
    if (m[1] !== undefined) parts.push(<code key={at} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{m[1]}</code>)
    else if (m[2] !== undefined) parts.push(<strong key={at}>{m[2]}</strong>)
    else parts.push(<em key={at}>{m[3]}</em>)
    cursor = at + m[0].length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return <>{parts}</>
}
