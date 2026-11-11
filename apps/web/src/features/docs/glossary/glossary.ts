import data from "@features/docs/glossary/glossary.dev.json"

/** Un terme du glossaire de la documentation développeur (`glossary.dev.json`). */
export interface GlossaryEntry {
  /** Identifiant stable : l'ancre `#g-<id>` du glossaire, et le nom des ancres de ses citations. */
  id: string
  /** Le terme tel qu'il s'affiche dans le glossaire. */
  terme: string
  /**
   * Les formes reconnues dans le texte (singulier, pluriel, orthographes). Insensibles à la casse,
   * sauf un sigle (deux majuscules ou plus : `SQL`, `tRPC`), reconnu tel quel.
   */
  variantes: string[]
  /** La définition courte, en une ou deux phrases : `code`, **gras** et *italique* permis. */
  definition: string
  /** Le chapitre et la section où le terme est défini pour la première fois dans le parcours. */
  definiEn: { vers: string; section: string }
  /** Facultatif : le chapitre qui l'approfondit. */
  approfondiEn?: { vers: string; section?: string }
}

export const GLOSSARY: readonly GlossaryEntry[] = data as GlossaryEntry[]
export const GLOSSARY_PAGE = "dev/annexe/glossaire"
export const glossaryHref = (id: string) => `/docs/${GLOSSARY_PAGE}#g-${id}`

const BY_ID = new Map(GLOSSARY.map((entry) => [entry.id, entry]))
export const glossaryEntry = (id: string) => BY_ID.get(id)

const isAcronym = (variant: string) => (variant.match(/\p{Lu}/gu) ?? []).length >= 2

/** Forme reconnue → identifiant : les sigles tels quels, le reste en minuscules. */
const EXACT = new Map<string, string>()
const FOLDED = new Map<string, string>()
for (const entry of GLOSSARY) {
  for (const variant of entry.variantes) {
    if (isAcronym(variant)) EXACT.set(variant, entry.id)
    else FOLDED.set(variant.toLowerCase(), entry.id)
  }
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Les plus longues d'abord : « table de jointure » avant « table ». Un mot entier, jamais un morceau. */
function wordRegex(variants: string[], flags: string): RegExp | null {
  if (variants.length === 0) return null
  const alternation = [...variants].sort((a, b) => b.length - a.length).map(escape).join("|")
  return new RegExp(`(?<![\\p{L}\\p{N}_-])(?:${alternation})(?![\\p{L}\\p{N}_-])`, flags)
}
const EXACT_RE = wordRegex([...EXACT.keys()], "gu")
const FOLDED_RE = wordRegex([...FOLDED.keys()], "giu")

export interface TermMatch {
  start: number
  end: number
  id: string
}

/** Les termes du glossaire présents dans un texte, sans chevauchement (le plus tôt, puis le plus long). */
export function findTerms(text: string): TermMatch[] {
  const found: TermMatch[] = []
  for (const [re, lookup] of [
    [EXACT_RE, (m: string) => EXACT.get(m)],
    [FOLDED_RE, (m: string) => FOLDED.get(m.toLowerCase())],
  ] as const) {
    if (!re) continue
    for (const m of text.matchAll(re)) {
      const id = lookup(m[0])
      if (id && m.index !== undefined) found.push({ start: m.index, end: m.index + m[0].length, id })
    }
  }
  found.sort((a, b) => a.start - b.start || b.end - a.end)
  const kept: TermMatch[] = []
  for (const match of found) {
    if (kept.length === 0 || match.start >= kept[kept.length - 1].end) kept.push(match)
  }
  return kept
}
