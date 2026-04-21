/**
 * trash.utils.ts
 *
 * Petites fonctions utilitaires centralisées pour la corbeille.
 *
 * Objectifs :
 * - Garder un format stable et testable
 * - Éviter de dupliquer des règles de normalisation / affichage
 */

/**
 * Normalise un chemin (supprime les / en début/fin).
 */
export function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Construit une version courte du previousPath, affichée dans la liste plate du bin.
 *
 * Exemple :
 * - previousPath: "AKFC/pending/cours/cours1"
 * - short:       "…/cours/cours1"
 *
 * On prend les 2 derniers segments (hors appRoot), car c’est un bon compromis lisibilité/contexte.
 */
export function buildPreviousPathShort(previousPath: string): string {
  const p = normalizePath(previousPath);
  const parts = p.split("/").filter(Boolean);
  if (parts.length <= 2) return p;

  // Retirer appRoot si présent (1er segment)
  const withoutRoot = parts.slice(1);
  if (withoutRoot.length <= 2) return `…/${withoutRoot.join("/")}`;

  const tail = withoutRoot.slice(-2);
  return `…/${tail.join("/")}`;
}

/**
 * Convertit un BigInt Prisma en number si c’est safe.
 *
 * Pourquoi :
 * - BigInt peut dépasser Number.MAX_SAFE_INTEGER.
 * - Notre DTO front attend un number.
 *
 * Stratégie :
 * - si la valeur dépasse le safe range, on renvoie undefined.
 *   (on préfère "pas de valeur" à une valeur incorrecte)
 */
export function bigIntToSafeNumber(value: bigint | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  if (value > max) return undefined;
  return Number(value);
}

/**
 * Identifie le storage caché du bin.
 *
 * NOTE :
 * - On NE se base jamais sur `${appRoot}/bin` (car UI virtuelle).
 * - On se base sur le storage RÉEL : `${appRoot}/bin/.trash/`.
 */
export function isTrashStoragePath(appRoot: string, path: string): boolean {
  const p = normalizePath(path);
  return p.startsWith(`${appRoot}/bin/.trash/`);
}

/**
 * Formate le suffix utilisé lors d'une restauration en collision.
 *
 * Format UX lisible :
 *   " (bin YYYY-MM-DD HH-mm)"
 */
export function formatBinSuffix(trashedAt: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = trashedAt.getFullYear();
  const mm = pad(trashedAt.getMonth() + 1);
  const dd = pad(trashedAt.getDate());
  const hh = pad(trashedAt.getHours());
  const mi = pad(trashedAt.getMinutes());
  return ` (bin ${yyyy}-${mm}-${dd} ${hh}-${mi})`;
}

function splitPath(path: string): string[] {
  return normalizePath(path).split("/").filter(Boolean);
}

/**
 * Applique un suffix "bin date" au dernier segment d'un path de dossier.
 */
export function suffixFolderPath(path: string, suffix: string): string {
  const parts = splitPath(path);
  if (parts.length === 0) return path;
  parts[parts.length - 1] = `${parts[parts.length - 1]}${suffix}`;
  return parts.join("/");
}

/**
 * Applique un suffix "bin date" à un filename (avant extension).
 */
export function suffixFileName(fileName: string, suffix: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx <= 0) return `${fileName}${suffix}`;
  const base = fileName.slice(0, idx);
  const ext = fileName.slice(idx);
  return `${base}${suffix}${ext}`;
}

/**
 * Applique le suffix à un path de fichier (dernier segment = filename).
 */
export function suffixFilePath(path: string, suffix: string): string {
  const parts = splitPath(path);
  if (parts.length === 0) return path;
  parts[parts.length - 1] = suffixFileName(parts[parts.length - 1], suffix);
  return parts.join("/");
}