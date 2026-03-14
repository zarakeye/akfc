import Link from "next/link"

import { getAllDocs } from "@/lib/docs/docs.source"
import { groupDocsBySection } from "@/lib/docs/docs.navigation"

export function DocsSidebar({
  currentPath,
}: {
  currentPath?: string
}) {
  const pages = getAllDocs()
  const sections = groupDocsBySection(pages)

  return (
    <aside className="hidden h-full w-72 shrink-0 border-r bg-muted/20 lg:block">
      <div className="h-full overflow-y-hidden px-6 py-8 hover:overflow-y-auto focus-within:overflow-y-auto">
        <nav className="space-y-8">
          {sections.map((section) => (
            <div key={section.section}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {section.section}
              </h2>

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const href = `/docs/${item.slug.join("/")}`
                  const active = currentPath === href

                  return (
                    <li key={item.slug.join("/")}>
                      <Link
                        href={href}
                        className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}