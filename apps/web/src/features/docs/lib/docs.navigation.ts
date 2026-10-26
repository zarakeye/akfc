import type { DocPage } from "@features/docs/lib/docs.types"

// Ordre des sections de la barre latérale. L'espace développeur suit le parcours en parties
// (Démarrer → Étude de cas) ; « Accueil » sert aux espaces guide et admin.
const SECTION_ORDER = [
  "Introduction",
  "Accueil",
  "Démarrer",
  "Fondations front",
  "Données",
  "API",
  "Authentification et droits",
  "Stockage et médias",
  "Contenu éditorial",
  "Domaine du club",
  "Membres et collaboration",
  "Légal et RGPD",
  "Interface transverse",
  "Qualité",
  "Infrastructure et déploiement",
  "Étude de cas",
] as const

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

export function groupDocsBySection(pages: DocPage[]) {
  const grouped = new Map<string, DocPage[]>()

  for (const page of pages) {
    const section = page.section ?? "Documentation"
    const existing = grouped.get(section) ?? []
    existing.push(page)
    grouped.set(section, existing)
  }

  const orderedSections = Array.from(grouped.entries()).map(
    ([section, items]) => ({
      section,
      items: [...items].sort((a, b) => {
        const orderCompare = (a.order ?? 9999) - (b.order ?? 9999)
        if (orderCompare !== 0) return orderCompare
        return a.title.localeCompare(b.title)
      }),
    })
  )

  return orderedSections.sort((a, b) => {
    const rankCompare = getSectionRank(a.section) - getSectionRank(b.section)
    if (rankCompare !== 0) return rankCompare

    return a.section.localeCompare(b.section)
  })
}

export function getPrevNextInSection(
  pages: DocPage[],
  slug: string[],
  section: string
) {
  const sectionPages = pages
    .filter((page) => page.section === section)
    .sort((a, b) => {
      const orderCompare = (a.order ?? 9999) - (b.order ?? 9999)
      if (orderCompare !== 0) return orderCompare
      return a.title.localeCompare(b.title)
    })

  const index = sectionPages.findIndex(
    (page) => page.slug.join("/") === slug.join("/")
  )

  return {
    prev: index > 0 ? sectionPages[index - 1] : null,
    next:
      index >= 0 && index < sectionPages.length - 1
        ? sectionPages[index + 1]
        : null,
  }
}