"use client"

import { InlineTocText } from "@features/docs/ui/InlineTocText"
import { useActiveHeading } from "@hooks/useActiveHeading"
import clsx from "clsx"
import type { TocItem } from "@features/docs/lib/docs.types"

export function DocsToc({ items }: { items: TocItem[] }) {
  const ids = items.map((item) => item.id)
  const activeId = useActiveHeading(ids)
  console.log(items)

  return (
    <nav className="sticky top-6 px-4">
      <p className="mb-3 text-sm font-semibold text-foreground">On this page</p>

      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className={clsx(
              item.depth === 3 && "pl-4",
              "transition-colors"
            )}
          >
            <a
              href={`#${item.id}`}
              className={clsx(
                "block py-1 text-muted-foreground hover:text-foreground",
                activeId === item.id && "font-medium text-foreground"
              )}
            >
              <InlineTocText text={item.displayValue ?? item.value} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default DocsToc