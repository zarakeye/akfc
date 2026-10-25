import type { ChapterEntities } from "@features/docs/entities/chapterGraph"

export interface DocFrontmatter {
  title: string
  description?: string
  section?: string
  order?: number
  /** Entités du schéma Prisma mobilisées par le chapitre, et leurs propriétés citées (carte des entités). */
  entities?: ChapterEntities | null
  /** Parcours du chapitre, tels qu'écrits dans l'en-tête (résolus par features/docs/entities/stories). */
  stories?: unknown
}

export interface DocPage extends DocFrontmatter {
  slug: string[]
}

export interface TocItem {
  id: string
  depth: number
  value: string
  displayValue: string
}
