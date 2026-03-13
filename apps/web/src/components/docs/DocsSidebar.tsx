import Link from "next/link"

import { getAllDocs } from "@/lib/docs/docs.source"
import { groupDocsBySection } from "@/lib/docs/docs.navigation"

export function DocsSidebar() {
  const pages = getAllDocs()
  const sections = groupDocsBySection(pages)

  return (
    <aside className="hidden w-full max-w-xs border-r px-4 py-6 lg:block">
      <nav className="space-y-8">
        {sections.map((section) => (
          <div key={section.section}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {section.section}
            </h2>

            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.slug.join("/")}>
                  <Link
                    href={`/docs/${item.slug.join("/")}`}
                    className="text-sm hover:underline underline-offset-4"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
