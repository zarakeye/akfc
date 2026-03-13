import type { DocPage } from "@/lib/docs/docs.types"

export function getPrevNext(pages: DocPage[], slug: string[]) {
  const index = pages.findIndex(
    (page) => page.slug.join("/") === slug.join("/")
  )

  return {
    prev: index > 0 ? pages[index - 1] : null,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : null,
  }
}

export function groupDocsBySection(pages: DocPage[]) {
  const grouped = new Map<string, DocPage[]>()

  for (const page of pages) {
    const key = page.section ?? "Documentation"
    const existing = grouped.get(key) ?? []
    existing.push(page)
    grouped.set(key, existing)
  }

  return Array.from(grouped.entries()).map(([section, items]) => ({
    section,
    items,
  }))
}
