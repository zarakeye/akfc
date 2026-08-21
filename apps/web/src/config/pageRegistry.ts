/**
 * Registre des PAGES ÉDITORIALES — pages au contenu PROPRE (non dynamiques, non
 * alimentées par un autre éditeur), avec un état publié/brouillon. Les pages
 * « consommatrices » (disciplines, stages, events, agenda, galerie…) affichent
 * du contenu à publication propre et NE figurent PAS ici : elles ne sont pas
 * gatées.
 *
 * `key` = clé stockée dans `PageVisibility` ; `path` = route PUBLIQUE (préfixe
 * couvrant les sous-routes). Source unique partagée middleware + centre de
 * contrôle « Pages éditoriales ».
 */
export type PageRegistryEntry = {
  key: string;
  label: string;
  path: string;
};

export const PAGE_REGISTRY: readonly PageRegistryEntry[] = [
  { key: "home", label: "Accueil", path: "/" },
  { key: "association", label: "L'association", path: "/about" },
  { key: "contacts", label: "Contacts", path: "/contacts" },
] as const;

/**
 * Résout un chemin de requête vers la clé de page éditoriale, ou `null` si la
 * route n'est pas éditoriale (donc jamais gatée). Accueil = match exact ; autres
 * = match exact OU préfixe (sous-routes incluses).
 */
export function pageKeyForPath(pathname: string): string | null {
  for (const entry of PAGE_REGISTRY) {
    if (entry.path === "/") {
      if (pathname === "/") return entry.key;
      continue;
    }
    if (pathname === entry.path || pathname.startsWith(entry.path + "/")) {
      return entry.key;
    }
  }
  return null;
}

/** Toutes les clés du registre (utile pour un traitement en masse). */
export const ALL_PAGE_KEYS: readonly string[] = PAGE_REGISTRY.map((e) => e.key);
