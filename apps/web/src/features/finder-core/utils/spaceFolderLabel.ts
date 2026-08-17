/**
 * Étiquette conviviale pour les dossiers d'ESPACE (groupe ou perso) du finder.
 *
 * Le chemin physique d'un espace est `${appRoot}/groups|persos/<slug>-<cuid>`
 * (le cuid = id DB, garantit unicité + stabilité au renommage). Ce suffixe est
 * illisible à l'écran : on le retire pour l'affichage et on titre-case le slug.
 *
 * Renvoie `null` si le dossier n'est PAS une racine d'espace (sous-dossiers,
 * dossiers ordinaires) → l'appelant garde alors `node.name`.
 *
 * NB : dérivé du slug (perd accents/casse d'origine). Pour le nom EXACT du
 * groupe/perso, il faudrait un `displayName` résolu côté backend.
 */
const CUID_SUFFIX = /-c[a-z0-9]{24}$/;
const SPACE_ROOT_PATH = /\/(groups|persos)\/[^/]+$/;

export function friendlySpaceFolderLabel(
  name: string,
  path: string,
): string | null {
  if (!SPACE_ROOT_PATH.test(path)) return null;
  if (!CUID_SUFFIX.test(name)) return null;
  const slug = name.replace(CUID_SUFFIX, "");
  return slug
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
