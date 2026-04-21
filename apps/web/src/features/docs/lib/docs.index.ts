import { cache } from "react"
import { getAllDocs } from "./docs.source"
import { groupDocsBySection } from "./docs.navigation"
import type { DocPage } from "./docs.types"

export interface DocsIndex {
  pages: DocPage[]
  navigation: ReturnType<typeof groupDocsBySection>
  bySlug: Map<string, DocPage>
}

export const generateDocsIndex = cache((): DocsIndex => {
  const pages = getAllDocs()

  const bySlug = new Map<string, DocPage>()
  for (const page of pages) {
    bySlug.set(page.slug.join("/"), page)
  }

  const navigation = groupDocsBySection(pages)

  return {
    pages,
    navigation,
    bySlug,
  }
})