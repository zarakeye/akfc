/**
 * Virtual paths.
 *
 * Ce fichier introduit le **virtual path** : le path tel que vu par la UI,
 * qui rend le finder indépendant du provider de stockage.
 *
 * ─── Pourquoi un type `VirtualPath` distinct de `StoragePath` ? ─────────
 *
 * Le path vu par la UI (virtuel) et le path stocké par l'adapter peuvent
 * différer : le mapping virtual ↔ storage est la responsabilité de chaque
 * adapter. Avec R2 seul, c'est l'identité (la clé R2 porte la même
 * structure, extension comprise).
 *
 * Le bénéfice de cette distinction n'est pas tellement dans le runtime
 * (souvent l'identité) mais dans le **type system** : on encode dans les
 * signatures qu'un path manipulé côté UI n'est PAS interchangeable avec
 * un path stocké côté backend. Une erreur de conversion oubliée sera
 * détectée à la compilation.
 *
 * ─── Branded type ────────────────────────────────────────────────────────
 *
 * `VirtualPath` est un branded type : c'est essentiellement un `string`
 * mais avec un tag de phantom type qui empêche l'usage d'un `string`
 * quelconque sans passer par `toVirtualPath()`. C'est une discipline
 * pure-TypeScript, zéro overhead runtime.
 */

/* -------------------------------------------------------------------------- */
/*  Branded type VirtualPath                                                  */
/* -------------------------------------------------------------------------- */

declare const virtualPathBrand: unique symbol;

/**
 * Path tel que vu par l'UI du finder. Agnostique du provider.
 *
 * Format conventionnel : `${APP_ROOT}/<segments...>` avec `/` comme séparateur.
 * Pas de segment `.`, `..`, ou commençant par `.` (sauf cas internes comme
 * `.trash` — qui n'est jamais exposé à la UI précisément pour cette raison).
 *
 * Construit via `toVirtualPath()` après validation. Le cast direct
 * `as VirtualPath` est volontairement laissé possible pour les cas internes
 * documentés (mappers backend qui produisent un path déjà validé en amont).
 */
export type VirtualPath = string & { readonly [virtualPathBrand]: 'VirtualPath' };

/**
 * Construit un `VirtualPath` après validation des règles de bon formatage.
 *
 * Levée d'erreur si le path :
 *   - est vide
 *   - contient un segment vide (`//`)
 *   - contient `..` (tentative de traversal)
 *   - se termine par `/`
 *
 * Ce sont les invariants minimaux. La sémantique applicative (path doit
 * commencer par `APP_ROOT`, par exemple) est laissée aux consommateurs
 * qui peuvent ajouter leurs propres `assertXxx()` au-dessus.
 */
export function toVirtualPath(raw: string): VirtualPath {
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new Error('toVirtualPath: path vide');
  }
  if (raw.endsWith('/')) {
    throw new Error(`toVirtualPath: path ne doit pas se terminer par "/" (reçu: "${raw}")`);
  }
  const segments = raw.split('/');
  for (const seg of segments) {
    if (seg.length === 0) {
      throw new Error(`toVirtualPath: segment vide dans "${raw}" (probable "//" consécutifs)`);
    }
    if (seg === '..') {
      throw new Error(`toVirtualPath: segment ".." interdit (path traversal) dans "${raw}"`);
    }
  }
  return raw as VirtualPath;
}

/**
 * Variante qui ne lève pas mais renvoie `null` en cas d'invalidité.
 * Pratique pour les filtres / parsers tolérants.
 */
export function tryToVirtualPath(raw: string): VirtualPath | null {
  try {
    return toVirtualPath(raw);
  } catch {
    return null;
  }
}
