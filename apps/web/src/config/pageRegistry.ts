/**
 * Registre des PAGES ÉDITORIALES — pages au contenu PROPRE (non dynamiques, non
 * alimentées par un autre éditeur), avec un état publié/brouillon. Les pages
 * « consommatrices » (disciplines, stages, events, agenda, galerie…) affichent
 * du contenu à publication propre et NE figurent PAS ici : elles ne sont pas
 * gatées.
 *
 * `key` = clé stockée dans `PageVisibility` ; `path` = route PUBLIQUE, en
 * correspondance EXACTE. Les sous-routes ne sont rattachées que si l'entrée
 * déclare `includeSubroutes: true` — sinon une page consommatrice imbriquée
 * (ex. /about/instructeurs) hériterait à tort de l'état de sa page parente.
 * Source unique partagée avec le centre de contrôle « Pages éditoriales ».
 */
export type PageRegistryEntry = {
  key: string;
  label: string;
  path: string;
  /** Rattacher aussi les sous-routes (path + "/..."). Défaut : false. */
  includeSubroutes?: boolean;
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
    if (
      pathname === entry.path ||
      (entry.includeSubroutes === true &&
        pathname.startsWith(entry.path + "/"))
    ) {
      return entry.key;
    }
  }
  return null;
}

/** Toutes les clés du registre (utile pour un traitement en masse). */
export const ALL_PAGE_KEYS: readonly string[] = PAGE_REGISTRY.map((e) => e.key);
