import type { TocItem } from "@/lib/docs/docs.types"

function baseSlugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function createUniqueSlugger() {
  const counts = new Map<string, number>()

  return (text: string) => {
    const base = baseSlugify(text)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)

    return count === 0 ? base : `${base}-${count}`
  }
}

export function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = []
  const slugify = createUniqueSlugger()
  const lines = markdown.split("\n")

  for (const line of lines) {
    const match = line.match(/^\s*(#{2,3})\s+(.*)$/)
    if (!match) continue

    const depth = match[1].length
    const value = match[2].trim()
    if (!value) continue

    toc.push({
      depth,
      value,
      id: slugify(value),
    })
  }

  return toc
}