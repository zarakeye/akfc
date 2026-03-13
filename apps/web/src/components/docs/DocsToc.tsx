"use client"

interface TocItem {
  depth: number
  value: string
  id: string
}

export function DocsToc({ items }: { items: TocItem[] }) {
  if (!items.length) return null

  return (
    <aside className="hidden xl:block w-64 shrink-0 pl-8">
      <div className="sticky top-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          On this page
        </p>

        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                marginLeft: `${(item.depth - 2) * 12}px`,
              }}
            >
              <a
                href={`#${item.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}