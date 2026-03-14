"use client"

import { useEffect, useState } from "react"

interface TocItem {
  depth: number
  value: string
  id: string
}

export function DocsToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[]

    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-100px 0px -60% 0px",
      }
    )

    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [items])

  if (!items.length) return null

  return (
    <aside className="hidden xl:block w-64 shrink-0 pl-8">
      <div className="sticky top-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          On this page
        </p>

        <ul className="space-y-2 text-sm">
          {items.map((item) => {
            const active = activeId === item.id

            return (
              <li
                key={item.id}
                style={{
                  marginLeft: `${(item.depth - 2) * 12}px`,
                }}
              >
                <a
                  href={`#${item.id}`}
                  className={`transition-colors ${
                    active
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.value}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}