"use client"

import { useEffect, useState } from "react"
import type { TocItem } from "@features/docs/lib/docs.types"
import { InlineTocText } from "@features/docs/ui/InlineTocText"
import { getDocsScroller, offsetWithin, onDocsScroll } from "@features/docs/lib/docsScroller"

export function DocsRightAside({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el)

    if (!headings.length) return

    const updateActiveHeading = () => {
      const container = getDocsScroller()
      if (!container) return
      const scrollTop = container.scrollTop
      const offsetThreshold = 120

      let current: string | null = null

      for (const heading of headings) {
        if (offsetWithin(heading, container) - scrollTop <= offsetThreshold) {
          current = heading.id
        }
      }

      setActiveId(current ?? headings[0]?.id ?? null)
    }

    updateActiveHeading()
    return onDocsScroll(updateActiveHeading)
  }, [items])

  const scrollToHeading = (id: string) => {
    const container = getDocsScroller()
    const heading = document.getElementById(id)

    if (!container || !heading) return

    // Un peu d'air au-dessus du titre visé.
    const top = offsetWithin(heading, container) - 24

    container.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    })

    setActiveId(id)
    window.history.replaceState(null, "", `#${id}`)
  }

  if (!items.length) return null

  return (
    <div className="h-full min-h-0">
      <div className="flex h-[calc(100%-1.5rem)] min-h-0 flex-col rounded-2xl border bg-background/70 backdrop-blur">
        <div className="h-full overflow-y-auto px-4 py-4 pr-2">
          <ul className="space-y-2 text-sm">
            {items.map((item, index) => {
              const active = activeId === item.id

              return (
                <li
                  key={`${item.id}-${index}`}
                  style={{
                    marginLeft: `${Math.max(item.depth - 2, 0) * 12}px`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`block w-full break-words text-left transition-colors ${
                      active
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <InlineTocText text={item.displayValue ?? item.value} />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DocsRightAside