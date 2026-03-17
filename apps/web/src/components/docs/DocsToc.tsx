"use client"

import { useActiveHeading } from "@/hooks/useActiveHeading"
import clsx from "clsx"

export interface TocItem {
  id: string
  text: string
  level: number
}

export function DocsToc({ items }: { items: TocItem[] }) {
  const ids = items.map((i) => i.id)
  const activeId = useActiveHeading(ids)

  return (
    <nav className="sticky top-6 px-4">
      <p className="mb-3 text-sm font-semibold text-foreground">On this page</p>

      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className={clsx(
              item.level === 3 && "pl-4",
              "transition-colors"
            )}
          >
            <a
              href={`#${item.id}`}
              className={clsx(
                "block py-1 text-muted-foreground hover:text-foreground",
                activeId === item.id && "text-foreground font-medium"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}