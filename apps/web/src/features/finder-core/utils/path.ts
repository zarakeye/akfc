import { PartSegment } from "@contracts/finder";

export function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export function buildPathSegments(path: string): PartSegment[] {
  const parts = splitPath(path);

  return parts.map((_, index) => {
    const fullPath = parts.slice(0, index + 1).join('/');

    return {
      name: parts[index],
      path: fullPath,
    };
  });
}

/**
 * Retourne le path parent d'un path donné.
 *
 *   `'AKFC/pending/foo.jpg'` → `'AKFC/pending'`
 *   `'AKFC'`                 → `''`
 *   `''`                     → `''`
 *
 * Utile par exemple pour la TreeView : un clic sur un fichier doit
 * naviguer vers son dossier parent.
 */
export function parentPath(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx === -1 ? '' : path.slice(0, idx);
}