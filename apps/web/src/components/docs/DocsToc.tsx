import type { TocItem } from "@/lib/docs/docs.types"

export function DocsToc({ items }: { items: TocItem[] }) {
  if (!items.length) return null

  return (
    <aside className="hidden w-64 pl-6 xl:block">
      <div className="sticky top-24">
        <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
          On this page
        </p>

        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className={item.depth === 3 ? "ml-4" : ""}>
              <a href={`#${item.id}`} className="hover:underline">
                {item.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
