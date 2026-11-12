import { GLOSSARY_PAGE, findTerms, glossaryEntry } from "@features/docs/glossary/glossary"

/** Le strict nécessaire de l'arbre mdast (et de ses nœuds MDX) pour ce parcours. */
interface MdNode {
  type: string
  value?: string
  depth?: number
  name?: string | null
  children?: MdNode[]
  attributes?: unknown[]
}

/** Là où un terme n'est jamais lié : titres, liens, code, et composants qui affichent du code. */
const SKIP_TYPES = new Set(["heading", "link", "linkReference", "code", "inlineCode", "mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"])
const SKIP_JSX = new Set(["Terme", "GlossaireCartes", "a", "Link", "CodeSnippet", "CodeExample", "CodeWalkthrough", "CodeSnippetWalkthrough", "DocsTable"])

/** Le texte d'un titre tel qu'il est écrit dans le fichier (le code entre accents graves). */
function headingText(node: MdNode): string {
  if (node.type === "text") return node.value ?? ""
  if (node.type === "inlineCode") return `\`${node.value ?? ""}\``
  return (node.children ?? []).map(headingText).join("")
}

export interface GlossaryOccurrence {
  id: string
  anchor: string
  section: string | null
}

/**
 * Repère chaque occurrence d'un terme du glossaire dans le texte d'un chapitre.
 *
 * Avec `transform`, remplace chacune par `<Terme id anchor>` (le rendu) ; sans, se contente de les
 * compter (l'index du glossaire). Les deux passent par cette seule fonction : les ancres
 * `t-<id>-<n>` que l'index cite sont exactement celles que la page porte.
 *
 * Un terme n'est pas lié dans la section qui le définit (ou dans l'introduction du chapitre, quand
 * c'est elle qui le définit) : il y est déjà expliqué.
 */
export function collectGlossary(tree: MdNode, slug: string[], transform: boolean): GlossaryOccurrence[] {
  const page = slug.join("/")
  const occurrences: GlossaryOccurrence[] = []
  if (page === GLOSSARY_PAGE) return occurrences
  const counters = new Map<string, number>()
  let section: string | null = null

  const visit = (node: MdNode) => {
    if (!node.children) return
    const next: MdNode[] = []
    for (const child of node.children) {
      if (SKIP_TYPES.has(child.type) || ((child.type === "mdxJsxFlowElement" || child.type === "mdxJsxTextElement") && SKIP_JSX.has(child.name ?? ""))) {
        next.push(child)
        continue
      }
      if (child.type !== "text") {
        visit(child)
        next.push(child)
        continue
      }
      const text = child.value ?? ""
      let cursor = 0
      for (const match of findTerms(text)) {
        const entry = glossaryEntry(match.id)
        if (!entry) continue
        if (entry.definiEn.vers === page && (entry.definiEn.section ?? null) === section) continue
        const n = (counters.get(match.id) ?? 0) + 1
        counters.set(match.id, n)
        const anchor = `t-${match.id}-${n}`
        occurrences.push({ id: match.id, anchor, section })
        if (!transform) continue
        if (match.start > cursor) next.push({ type: "text", value: text.slice(cursor, match.start) })
        next.push({
          type: "mdxJsxTextElement",
          name: "Terme",
          attributes: [
            { type: "mdxJsxAttribute", name: "id", value: match.id },
            { type: "mdxJsxAttribute", name: "anchor", value: anchor },
          ],
          children: [{ type: "text", value: text.slice(match.start, match.end) }],
        })
        cursor = match.end
      }
      if (!transform || cursor === 0) next.push(child)
      else if (cursor < text.length) next.push({ type: "text", value: text.slice(cursor) })
    }
    node.children = next
  }

  for (const child of tree.children ?? []) {
    if (child.type === "heading" && (child.depth === 2 || child.depth === 3)) section = headingText(child).trim()
    // Une enveloppe autour de chaque bloc : le bloc lui-même est conservé, seuls ses enfants changent.
    visit({ type: "wrapper", children: [child] })
  }
  if (transform && occurrences.length > 0 && tree.children) {
    // Les cartes de la page : une par terme présent, préparées une fois, en fin de chapitre.
    const ids = [...new Set(occurrences.map((o) => o.id))].join(",")
    tree.children.push({
      type: "mdxJsxFlowElement",
      name: "GlossaireCartes",
      attributes: [{ type: "mdxJsxAttribute", name: "ids", value: ids }],
      children: [],
    })
  }
  return occurrences
}

/** Le plugin remark du rendu : `[remarkGlossary, { slug }]`. */
export function remarkGlossary(options: { slug: string[] }) {
  return (tree: MdNode) => {
    collectGlossary(tree, options.slug, true)
  }
}
