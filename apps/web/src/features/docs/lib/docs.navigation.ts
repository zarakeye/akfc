import type { DocPage } from "@features/docs/lib/docs.types"

// Ordre des sections de la barre latérale. L'espace développeur suit le parcours en parties
// (Démarrer → Étude de cas) ; « Accueil » sert aux espaces guide et admin, puis les parties du guide et de l'admin.
const SECTION_ORDER = [
  "Introduction",
  "Accueil",
  "Découvrir le site",
  "Espace membre",
  "Prise en main",
  "Membres et demandes",
  "Publier",
  "Catalogue et programme",
  "Médiathèque",
  "Réglages",
  "Démarrer",
  "Configuration",
  "Fondations front",
  "Données",
  "Formulaires",
  "API",
  "Authentification et droits",
  "Stockage et médias",
  "Le finder",
  "Les envois de fichiers",
  "Le recadrage",
  "Contenu éditorial",
  "L’éditeur de texte riche",
  "Domaine du club",
  "Membres et collaboration",
  "Légal et RGPD",
  "Interface transverse",
  "Qualité",
  "Infrastructure et déploiement",
  "Étude de cas",
] as const

/** Parties d'accueil d'un espace : en tête de la barre latérale, sans numéro. */
const UNNUMBERED_SECTIONS: readonly string[] = ["Introduction", "Accueil"]

function getSectionRank(section: string): number {
  const index = SECTION_ORDER.indexOf(
    section as (typeof SECTION_ORDER)[number]
  )

  return index === -1 ? SECTION_ORDER.length : index
}

/**
 * Chapitres précédent et suivant, dans l'ordre de LECTURE : celui de la barre latérale (parties
 * dans l'ordre de SECTION_ORDER, chapitres par `order`), pas celui des fichiers sur le disque
 * (sinon « contenu/… » précédait « demarrer/… »).
 */
export function getPrevNext(unordered: DocPage[], slug: string[]) {
  const pages = groupDocsBySection(unordered).flatMap((section) => section.items)
  const index = pages.findIndex(
    (page) => page.slug.join("/") === slug.join("/")
  )

  return {
    prev: index > 0 ? pages[index - 1] : null,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : null,
  }
}

/**
 * Les parties d'un espace et leurs chapitres, dans l'ordre de lecture, numérotés : une partie reçoit
 * son rang (1, 2, 3…), un chapitre le rang de sa partie et le sien (« 3.2 »). La numérotation
 * recommence dans chaque espace, et les parties d'accueil n'en ont pas.
 */
export function groupDocsBySection(pages: DocPage[]): { section: string; number: number | null; items: DocPage[] }[] {
  const grouped = new Map<string, DocPage[]>()

  for (const page of pages) {
    const section = page.section ?? "Documentation"
    const existing = grouped.get(section) ?? []
    existing.push(page)
    grouped.set(section, existing)
  }

  const orderedSections = Array.from(grouped.entries())
    .map(([section, items]) => ({
      section,
      items: [...items].sort((a, b) => {
        const orderCompare = (a.order ?? 9999) - (b.order ?? 9999)
        if (orderCompare !== 0) return orderCompare
        return a.title.localeCompare(b.title)
      }),
    }))
    .sort((a, b) => {
      const rankCompare = getSectionRank(a.section) - getSectionRank(b.section)
      if (rankCompare !== 0) return rankCompare

      return a.section.localeCompare(b.section)
    })

  let partNumber = 0
  return orderedSections.map(({ section, items }) => {
    if (UNNUMBERED_SECTIONS.includes(section)) return { section, number: null, items }
    partNumber += 1
    const number = partNumber
    return { section, number, items: items.map((page, i) => ({ ...page, number: `${number}.${i + 1}` })) }
  })
}

/** La page courante, avec son numéro et sa partie (pour le titre et le fil d'Ariane). */
export function getNumberedDoc(unordered: DocPage[], slug: string[]): { page: DocPage; section: string; sectionNumber: number | null } | null {
  const key = slug.join("/")
  for (const group of groupDocsBySection(unordered)) {
    const page = group.items.find((item) => item.slug.join("/") === key)
    if (page) return { page, section: group.section, sectionNumber: group.number }
  }
  return null
}
