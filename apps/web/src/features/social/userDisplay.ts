/**
 * Helpers PURS d'affichage d'un utilisateur (aucun hook → importable côté
 * SERVEUR comme client). Séparés de `UserPortrait` (composant client qui lit
 * le store de version d'avatar) : mélanger un hook client et ces fonctions
 * dans un même module rendait `formatUserName` « client », donc inappelable
 * depuis un Server Component (ex. PostCard rendant PageRenderer).
 *
 * `DisplayUser` est la projection minimale renvoyée par les routers social
 * (même `select` partout) — les types inférés de tRPC y sont structurellement
 * assignables.
 */

export interface DisplayUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string;
  avatar: string | null;
  image: string | null;
}

/** Nom complet → pseudo → email (cascade habituelle du projet). */
export function formatUserName(u: DisplayUser): string {
  const full = [u.firstName, u.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return full || u.pseudo || u.email;
}

/**
 * URL du proxy pour un publicId Cloudinary (délivrance publique,
 * authenticated signé côté serveur — marche pour les anonymes).
 */
export function publicIdToUrl(publicId: string, version?: number): string {
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  const v = version ? `&v=${version}` : "";
  return `/api/media/by-public-id/${enc}?variant=large${v}`;
}

/**
 * URL de portrait. `avatar` est un publicId Cloudinary (uploadé via la
 * fiche profil) → passe par le proxy. `image` est déjà une URL absolue
 * (fournisseur OAuth) → utilisée telle quelle. Sinon null (→ initiales).
 */
export function portraitUrl(u: DisplayUser, version?: number): string | null {
  if (u.avatar) return publicIdToUrl(u.avatar, version);
  if (u.image) return u.image;
  return null;
}

/** Deux premières lettres du nom, pour le fallback sans portrait. */
export function initials(u: DisplayUser): string {
  return formatUserName(u).slice(0, 2).toUpperCase();
}
