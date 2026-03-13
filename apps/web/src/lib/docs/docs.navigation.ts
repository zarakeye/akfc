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
    const section = page.section ?? "Documentation"
    const existing = grouped.get(section) ?? []
    existing.push(page)
    grouped.set(section, existing)
  }

  const orderedSections = Array.from(grouped.entries()).map(
    ([section, items]) => ({
      section,
      items: [...items].sort((a, b) => {
        const orderCompare = (a.order ?? 9999) - (b.order ?? 9999)
        if (orderCompare !== 0) return orderCompare
        return a.title.localeCompare(b.title)
      }),
    })
  )

  return orderedSections.sort((a, b) => a.section.localeCompare(b.section))
}