import type { TocItem } from "@/features/docs/lib/docs.types"
import { slugifyHeading } from "@/features/docs/lib/slugifyHeading"

function stripMarkdownForSlug(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim()
}

function createUniqueSlugger() {
  const counts = new Map<string, number>()

  return (text: string) => {
    const base = slugifyHeading(text)
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
    const rawValue = match[2].trim()
    if (!rawValue) continue

    const slugText = stripMarkdownForSlug(rawValue)

    toc.push({
      depth,
      value: slugText,
      displayValue: rawValue,
      id: slugify(slugText),
    })
  }

  return toc
}