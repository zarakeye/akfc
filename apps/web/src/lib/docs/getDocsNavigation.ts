import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { cache } from "react"

const DOCS_PATH = path.join(process.cwd(), "content/docs")

export interface DocItem {
  title: string
  section: string
  order: number
  slug: string
}

export const getDocsNavigation = cache((): Record<string, DocItem[]> => {
  const files: string[] = []

  function walk(dir: string) {
    const entries = fs.readdirSync(dir)

    for (const entry of entries) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)

      if (stat.isDirectory()) {
        walk(full)
      } else if (entry.endsWith(".mdx")) {
        files.push(full)
      }
    }
  }

  walk(DOCS_PATH)

  const docs: DocItem[] = files.map((file) => {
    const source = fs.readFileSync(file, "utf8")
    const { data } = matter(source)

    const slug =
      "/docs/" +
      path
        .relative(DOCS_PATH, file)
        .replace(/\.mdx$/, "")
        .replace(/\\/g, "/")

    return {
      title: data.title,
      section: data.section,
      order: data.order ?? 999,
      slug,
    }
  })

  const grouped: Record<string, DocItem[]> = {}

  for (const doc of docs) {
    if (!grouped[doc.section]) {
      grouped[doc.section] = []
    }

    grouped[doc.section].push(doc)
  }

  for (const section of Object.keys(grouped)) {
    grouped[section].sort((a, b) => a.order - b.order)
  }

  return grouped
})