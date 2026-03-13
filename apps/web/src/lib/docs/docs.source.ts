import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

import type { DocFrontmatter, DocPage } from "@/lib/docs/docs.types"

function resolveDocsRoot(): string {
  const cwd = process.cwd()

  const directWebPath = path.join(cwd, "content", "docs")
  if (fs.existsSync(directWebPath)) {
    return directWebPath
  }

  const monorepoPath = path.join(cwd, "apps", "web", "content", "docs")
  if (fs.existsSync(monorepoPath)) {
    return monorepoPath
  }

  throw new Error(
    `Unable to locate docs root. Checked:\n- ${directWebPath}\n- ${monorepoPath}`
  )
}

export const DOCS_ROOT = resolveDocsRoot()

function walkDocs(dir: string, slug: string[] = []): DocPage[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const pages: DocPage[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      pages.push(...walkDocs(fullPath, [...slug, entry.name]))
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
      continue
    }

    const source = fs.readFileSync(fullPath, "utf8")
    const { data } = matter(source)

    const frontmatter = data as Partial<DocFrontmatter>
    const fileSlug = entry.name.replace(/\.mdx$/, "")

    pages.push({
      slug: [...slug, fileSlug],
      title:
        typeof frontmatter.title === "string" ? frontmatter.title : fileSlug,
      description:
        typeof frontmatter.description === "string"
          ? frontmatter.description
          : undefined,
      section:
        typeof frontmatter.section === "string"
          ? frontmatter.section
          : undefined,
      order:
        typeof frontmatter.order === "number" ? frontmatter.order : undefined,
    })
  }

  return pages
}

export function getAllDocs(): DocPage[] {
  return walkDocs(DOCS_ROOT).sort((a, b) => {
    const sectionCompare = (a.section ?? "").localeCompare(b.section ?? "")
    if (sectionCompare !== 0) return sectionCompare

    const orderCompare = (a.order ?? 9999) - (b.order ?? 9999)
    if (orderCompare !== 0) return orderCompare

    return a.title.localeCompare(b.title)
  })
}

export function getDocFilePath(slug: string[]): string {
  return path.join(DOCS_ROOT, ...slug) + ".mdx"
}

export function docExists(slug: string[]): boolean {
  return fs.existsSync(getDocFilePath(slug))
}

export function getDocSource(slug: string[]): {
  source: string
  frontmatter: DocFrontmatter
} {
  const filePath = getDocFilePath(slug)
  const source = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(source)

  const frontmatter = data as Partial<DocFrontmatter>

  return {
    source: content,
    frontmatter: {
      title:
        typeof frontmatter.title === "string"
          ? frontmatter.title
          : slug.at(-1) ?? "Untitled",
      description:
        typeof frontmatter.description === "string"
          ? frontmatter.description
          : undefined,
      section:
        typeof frontmatter.section === "string"
          ? frontmatter.section
          : undefined,
      order:
        typeof frontmatter.order === "number" ? frontmatter.order : undefined,
    },
  }
}