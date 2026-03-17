import { generateDocsIndex } from "./docs.index"
import { getDocSource } from "./docs.source"

export interface SearchDoc {
  id: string
  title: string
  section?: string
  slug: string
  content: string
}

function stripMdx(source: string): string {
  return source
    // imports / exports MDX
    .replace(/^import .*$/gm, "")
    .replace(/^export .*$/gm, "")
    // jsx / mdx components
    .replace(/<[^>]+>/g, " ")
    // fenced code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // inline code
    .replace(/`([^`]+)`/g, "$1")
    // markdown links
    .replace(/$begin:math:display$\(\[\^$end:math:display$]+\)\]$begin:math:text$\[\^\)\]\+$end:math:text$/g, "$1")
    // markdown headings / lists
    .replace(/^[#>\-\*\+]+\s?/gm, "")
    // markdown formatting
    .replace(/[*_~]/g, "")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim()
}

export function getSearchDocuments(): SearchDoc[] {
  const { pages } = generateDocsIndex()

  return pages.map((page) => {
    const { source } = getDocSource(page.slug)

    return {
      id: page.slug.join("/"),
      title: page.title,
      section: page.section,
      slug: "/docs/" + page.slug.join("/"),
      content: stripMdx(source),
    }
  })
}