import { cache } from "react"

import { generateDocsIndex } from "@features/docs/lib/docs.index"
import { getNumberedDoc } from "@features/docs/lib/docs.navigation"
import { slugifyHeading } from "@features/docs/lib/slugifyHeading"
import type { DocSpaceId } from "@features/docs/lib/docs.spaces"

export interface DocTarget {
  href: string
  label: string
}

/**
 * Un renvoi vers un chapitre de la doc développeur : son adresse (avec la section) et son libellé
 * numéroté (« 5.1 Pourquoi tout commence par le modèle »). Mis en cache pour la requête : une page
 * peut citer des centaines de termes.
 */
export const docTarget = cache((vers: string, section?: string): DocTarget => {
  const slug = vers.split("/").filter(Boolean)
  const found = getNumberedDoc(generateDocsIndex(slug[0] as DocSpaceId).pages, slug)
  const title = found ? `${found.page.number ?? ""} ${found.page.title}`.trim() : vers
  return {
    href: `/docs/${vers}${section ? `#${slugifyHeading(section)}` : ""}`,
    label: section ? `${title} · ${section.replace(/`/g, "")}` : title,
  }
})
