import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import { unified } from "unified"

import { collectGlossary } from "@features/docs/glossary/remarkGlossary"
import { generateDocsIndex } from "@features/docs/lib/docs.index"
import { getDocSource } from "@features/docs/lib/docs.source"

export interface Citation {
  /** La page qui cite le terme : son numéro, son titre, sa partie. */
  slug: string[]
  number: string | null
  title: string
  section: string
  /** L'ancre de la première occurrence, et le nombre d'occurrences. */
  firstAnchor: string
  count: number
}

let memo: Map<string, Citation[]> | null = null

/**
 * Pour chaque terme, les pages qui le citent, dans l'ordre de lecture.
 *
 * Chaque chapitre est relu avec le même analyseur MDX que le rendu, et la même fonction de repérage
 * (`collectGlossary`) : l'ancre citée ici est celle que porte la page. Calculé une fois par processus
 * en production ; à chaque visite en développement, pour suivre les modifications.
 */
export function getGlossaryCitations(): Map<string, Citation[]> {
  if (memo && process.env.NODE_ENV === "production") return memo
  const byTerm = new Map<string, Citation[]>()
  const parser = unified().use(remarkParse).use(remarkMdx)
  for (const group of generateDocsIndex("dev").navigation) {
    for (const page of group.items) {
      const { source } = getDocSource(page.slug)
      let occurrences
      try {
        occurrences = collectGlossary(parser.parse(source) as never, page.slug, false)
      } catch {
        continue
      }
      const perTerm = new Map<string, { first: string; count: number }>()
      for (const o of occurrences) {
        const seen = perTerm.get(o.id)
        if (seen) seen.count += 1
        else perTerm.set(o.id, { first: o.anchor, count: 1 })
      }
      for (const [id, { first, count }] of perTerm) {
        const list = byTerm.get(id) ?? []
        list.push({ slug: page.slug, number: page.number ?? null, title: page.title, section: group.section, firstAnchor: first, count })
        byTerm.set(id, list)
      }
    }
  }
  memo = byTerm
  return byTerm
}
