/**
 * Étiquette conviviale des dossiers d'ESPACE (groupe / perso) du finder.
 *
 * Chemin d'un espace : `${appRoot}/groups|persos/<slug>-<cuid>` (cuid = id DB,
 * garant d'unicité/stabilité au renommage). Illisible tel quel. On affiche le
 * nom EXACT (résolu par le backend via `storage.spaceDisplayNames`, indexé par
 * cuid) ; à défaut (map absente), on retire le cuid et on titre-case le slug.
 *
 * Renvoie `null` si le dossier n'est PAS une racine d'espace (sous-dossiers,
 * dossiers ordinaires) → l'appelant garde `node.name`.
 */
const CUID_RE = /-(c[a-z0-9]{24})$/;
const SPACE_ROOT_PATH = /\/(groups|persos)\/[^/]+$/;

function slugFallback(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function friendlySpaceFolderLabel(
  name: string,
  path: string,
  displayNames?: Record<string, string>,
): string | null {
  if (!SPACE_ROOT_PATH.test(path)) return null;
  const m = name.match(CUID_RE);
  if (!m) return null;
  const exact = displayNames?.[m[1]];
  if (exact) return exact;
  return slugFallback(name.replace(CUID_RE, ""));
}
