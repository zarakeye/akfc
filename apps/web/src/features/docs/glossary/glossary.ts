import dev from "@features/docs/glossary/glossary.dev.json"
import guide from "@features/docs/glossary/glossary.guide.json"
import admin from "@features/docs/glossary/glossary.admin.json"

/** Un terme d'un glossaire de la documentation (`glossary.<espace>.json`). */
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
  /**
   * Le chapitre et la section où le terme est défini pour la première fois dans le parcours, dans
   * le même espace. Sans section : l'introduction du chapitre, avant son premier titre.
   */
  definiEn: { vers: string; section?: string }
  /** Facultatif : le chapitre qui l'approfondit. */
  approfondiEn?: { vers: string; section?: string }
}

export interface TermMatch {
  start: number
  end: number
  id: string
}

/** Les espaces de la documentation qui ont un glossaire. */
export type GlossarySpace = "dev" | "guide" | "admin"

/** Le glossaire d'un espace : ses termes, sa page, et la façon de les repérer dans un texte. */
export interface Glossary {
  space: GlossarySpace
  entries: readonly GlossaryEntry[]
  /** La page annexe du glossaire, sans `/docs/` (« dev/annexe/glossaire »). */
  page: string
  /**
   * Lier chaque occurrence (la doc développeur, aux termes techniques et assez rares), ou la
   * première de chaque page seulement (le Guide et l'Admin, où « stage » ou « groupe » reviennent
   * à chaque phrase : tout souligner rendrait le texte illisible).
   */
  firstOnly: boolean
  href: (id: string) => string
  entry: (id: string) => GlossaryEntry | undefined
  /** Les termes présents dans un texte, sans chevauchement (le plus tôt, puis le plus long). */
  findTerms: (text: string) => TermMatch[]
}

const isAcronym = (variant: string) => (variant.match(/\p{Lu}/gu) ?? []).length >= 2

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Les plus longues d'abord : « table de jointure » avant « table ». Un mot entier, jamais un morceau. */
function wordRegex(variants: string[], flags: string): RegExp | null {
  if (variants.length === 0) return null
  const alternation = [...variants].sort((a, b) => b.length - a.length).map(escape).join("|")
  return new RegExp(`(?<![\\p{L}\\p{N}_-])(?:${alternation})(?![\\p{L}\\p{N}_-])`, flags)
}

function createGlossary(space: GlossarySpace, data: unknown, firstOnly: boolean): Glossary {
  const entries = data as GlossaryEntry[]
  const page = `${space}/annexe/glossaire`
  const byId = new Map(entries.map((entry) => [entry.id, entry]))

  /** Forme reconnue → identifiant : les sigles tels quels, le reste en minuscules. */
  const exact = new Map<string, string>()
  const folded = new Map<string, string>()
  for (const entry of entries) {
    for (const variant of entry.variantes) {
      if (isAcronym(variant)) exact.set(variant, entry.id)
      else folded.set(variant.toLowerCase(), entry.id)
    }
  }
  const exactRe = wordRegex([...exact.keys()], "gu")
  const foldedRe = wordRegex([...folded.keys()], "giu")

  const findTerms = (text: string): TermMatch[] => {
    const found: TermMatch[] = []
    for (const [re, lookup] of [
      [exactRe, (m: string) => exact.get(m)],
      [foldedRe, (m: string) => folded.get(m.toLowerCase())],
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

  return {
    space,
    entries,
    page,
    firstOnly,
    href: (id) => `/docs/${page}#g-${id}`,
    entry: (id) => byId.get(id),
    findTerms,
  }
}

export const GLOSSARIES: Record<GlossarySpace, Glossary> = {
  dev: createGlossary("dev", dev, false),
  guide: createGlossary("guide", guide, true),
  admin: createGlossary("admin", admin, true),
}

/** Le glossaire d'une page, d'après le premier segment de son adresse (`guide/...`). */
export function glossaryOfPage(slug: readonly string[]): Glossary | undefined {
  return (GLOSSARIES as Record<string, Glossary | undefined>)[slug[0] ?? ""]
}
