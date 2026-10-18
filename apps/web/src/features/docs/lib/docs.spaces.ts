/**
 * Les trois espaces de la documentation. L'espace d'une page est le PREMIER dossier de son chemin
 * sous `content/docs/` — et donc le premier segment de son URL (`/docs/guide/…`).
 *
 *   guide : visiteurs et membres (public) ;
 *   admin : administration du site (réservé aux administrateurs, contrôlé côté serveur) ;
 *   dev   : développeurs (public : la vitrine technique du projet).
 */
export type DocSpaceId = "guide" | "admin" | "dev"

export interface DocSpace {
  id: DocSpaceId
  title: string
  description: string
  adminOnly: boolean
}

export const DOC_SPACES: DocSpace[] = [
  {
    id: "guide",
    title: "Guide du site",
    description: "Pour les visiteurs et les membres : consulter, s'inscrire, gérer son profil, ses documents et ses espaces.",
    adminOnly: false,
  },
  {
    id: "admin",
    title: "Administration",
    description: "Pour les administrateurs : publier, gérer les membres, les groupes, la bibliothèque et les réglages.",
    adminOnly: true,
  },
  {
    id: "dev",
    title: "Développeurs",
    description: "Pour les développeurs : du clone du projet à sa mise en production, pas à pas.",
    adminOnly: false,
  },
]

export function getSpace(id: string | undefined): DocSpace | undefined {
  return DOC_SPACES.find((s) => s.id === id)
}

export function spaceOf(slug: string[]): DocSpace | undefined {
  return getSpace(slug[0])
}
