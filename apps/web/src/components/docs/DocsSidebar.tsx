"use client"

import { useState } from "react"
import Link from "next/link"

import type { DocPage } from "@/lib/docs/docs.types"

type NavigationSection = {
  section: string
  items: DocPage[]
}

export function DocsSidebar({
  currentPath,
  navigation,
}: {
  currentPath?: string
  navigation: NavigationSection[]
}) {
  const [open, setOpen] = useState(true)

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col border-r bg-background transition-all duration-300 ${
        open ? "w-[260px]" : "w-[64px]"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b px-3 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Réduire la navigation" : "Ouvrir la navigation"}
          className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ☰
        </button>

        {open ? (
          <span className="pr-2 text-sm font-semibold text-foreground">
            Documentation
          </span>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {open ? (
          navigation.map(({ section, items }) => (
            <div key={section} className="mb-8">
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {section}
              </h3>

              <ul className="space-y-1">
                {items.map((doc) => {
                  const slug = `/docs/${doc.slug.join("/")}`
                  const active = currentPath === slug

                  return (
                    <li key={slug}>
                      <Link
                        href={slug}
                        className={
                          active
                            ? "block rounded-md bg-muted px-2 py-1.5 text-sm font-medium text-foreground"
                            : "block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        }
                      >
                        {doc.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3">
            {navigation.map(({ section }) => (
              <div
                key={section}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-semibold uppercase text-muted-foreground"
                title={section}
              >
                {section.slice(0, 2)}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default DocsSidebar