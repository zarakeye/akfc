/**
 * Registre des pages publiques « toggables » (mode « En construction »).
 *
 * Source unique partagée par le middleware d'enforcement et le centre de
 * contrôle admin. `key` est la clé stockée dans `PageVisibility` ; `path` est la
 * route (préfixe qui couvre aussi les sous-routes de la section).
 *
 * Pages fonctionnelles (profil, documents, mes-espaces, dashboard) volontairement
 * absentes : elles ne sont pas du « contenu en construction ».
 */
export type PageRegistryEntry = {
  key: string;
  label: string;
  path: string;
};

export const PAGE_REGISTRY: readonly PageRegistryEntry[] = [
  { key: "home", label: "Accueil", path: "/" },
  { key: "about", label: "À propos", path: "/about" },
  { key: "agenda", label: "Agenda", path: "/agenda" },
  { key: "contacts", label: "Contacts", path: "/contacts" },
  { key: "course", label: "Cours", path: "/course" },
  { key: "disciplines", label: "Disciplines", path: "/disciplines" },
  { key: "events", label: "Événements", path: "/events" },
  { key: "gallery", label: "Galerie", path: "/gallery" },
  { key: "infos", label: "Infos", path: "/infos" },
  { key: "stages", label: "Stages", path: "/stages" },
] as const;

/**
 * Résout un chemin de requête vers la clé de page correspondante, ou `null` si
 * la route n'est pas toggable (donc jamais gatée). Accueil = match exact ;
 * sections = match exact OU préfixe (pour couvrir leurs sous-routes).
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

/** Toutes les clés du registre (utile pour le toggle global). */
export const ALL_PAGE_KEYS: readonly string[] = PAGE_REGISTRY.map((e) => e.key);
