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
    <aside className="hidden lg:block w-72 shrink-0 border-r bg-muted/20">
      <div className="h-full overflow-y-auto px-6 py-8">
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
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
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