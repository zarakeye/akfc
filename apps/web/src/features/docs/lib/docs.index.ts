import { cache } from "react"
import { getAllDocs } from "./docs.source"
import { groupDocsBySection } from "./docs.navigation"
import { DOC_SPACES, type DocSpaceId } from "./docs.spaces"
import type { DocPage } from "./docs.types"

export interface DocsIndex {
  pages: DocPage[]
  navigation: ReturnType<typeof groupDocsBySection>
  bySlug: Map<string, DocPage>
}

/**
 * Index d'UN espace (`guide`, `admin`, `dev`) : ses pages, sa navigation, ses slugs. Chaque espace
 * a sa propre barre latérale, sa recherche et sa pagination ; aucune page admin ne fuit ailleurs.
 * Sans espace (accueil `/docs`) : la navigation liste les espaces eux-mêmes.
 */
export const generateDocsIndex = cache((space: DocSpaceId | null = null): DocsIndex => {
  const all = getAllDocs()
  const pages = space ? all.filter((page) => page.slug[0] === space) : []

  const bySlug = new Map<string, DocPage>()
  for (const page of pages) {
    bySlug.set(page.slug.join("/"), page)
  }

  const navigation = space
    ? groupDocsBySection(pages)
    : [
        {
          section: "Espaces",
          items: DOC_SPACES.map((s, i) => ({ slug: [s.id], title: s.title, section: "Espaces", order: i })),
        },
      ]

  return {
    pages,
    navigation,
    bySlug,
  }
})
