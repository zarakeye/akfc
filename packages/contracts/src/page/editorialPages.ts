/**
 * Les pages éditoriales : celles qui ont un interrupteur publié / brouillon (`PageVisibility`, clé
 * ci-dessous). Partagé par le registre des pages du front (`config/pageRegistry.ts`, qui ne peut
 * déclarer que ces clés) et par la route publique des fichiers (`isPubliclyPlaced`) : la page
 * `association` non publiée ne sert pas ses fichiers au public.
 *
 * Une page de contenu qui n'est PAS ici (`/infos/<slug>`, compléments des pages légales) n'a pas
 * d'interrupteur : elle est publique dès qu'elle existe.
 */
export const EDITORIAL_PAGE_KEYS = ["home", "association", "contacts", "inscription"] as const;

export type EditorialPageKey = (typeof EDITORIAL_PAGE_KEYS)[number];

export function isEditorialPageKey(key: string): key is EditorialPageKey {
  return (EDITORIAL_PAGE_KEYS as readonly string[]).includes(key);
}
