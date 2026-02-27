/**
 * binTrashUi.ts
 *
 * Helpers UI pour masquer l'implémentation technique de la corbeille:
 * - Storage réel: <APP>/bin/.trash/<trashId>/...
 * - UI: on cache ".trash" et on remplace "<trashId>" par basename(previousPath)
 */

export type TrashEntryUi = {
  id: string; // trashId
  previousPath: string; // provenance
  displayName: string; // basename(previousPath)
};

export type TrashMap = Map<string, TrashEntryUi>;

export function normalizePath(p: string) {
  return p.replace(/^\/+|\/+$/g, "");
}

export function basenamePath(p: string): string {
  const parts = normalizePath(p).split("/").filter(Boolean);
  return parts[parts.length - 1] ?? p;
}

/**
 * Retourne le trashId si fullPath est dans /bin/.trash/<trashId>/...
 */
export function getTrashIdFromStoragePath(fullPath: string): string | null {
  const parts = normalizePath(fullPath).split("/").filter(Boolean);
  // attendu: [APP, bin, .trash, <trashId>, ...]
  const idx = parts.indexOf(".trash");
  if (idx === -1) return null;
  const trashId = parts[idx + 1];
  return trashId ?? null;
}

/**
 * Retourne le "relative path" à l'intérieur du storage trashId:
 * fullPath: AKFC/bin/.trash/<trashId>/a/b/c
 * => "a/b/c"
 */
export function getRelativePathInsideTrash(fullPath: string, trashId: string): string {
  const normalized = normalizePath(fullPath);

  const needle = `/bin/.trash/${trashId}/`;
  const idx = normalized.indexOf(needle);
  if (idx === -1) return "";

  return normalized.slice(idx + needle.length);
}

/**
 * Construit un tooltip "user-facing" à partir d'un chemin technique.
 * - root trashId => previousPath
 * - descendants => previousPath + "/" + relative
 */
export function getBinTooltipTitle(fullPath: string, trashMap: TrashMap): string {
  const trashId = getTrashIdFromStoragePath(fullPath);
  if (!trashId) return fullPath;

  const entry = trashMap.get(trashId);
  if (!entry) return fullPath;

  const relative = getRelativePathInsideTrash(fullPath, trashId);
  if (!relative) return entry.previousPath;

  return `${normalizePath(entry.previousPath)}/${relative}`;
}

/**
 * Détermine le label UI d'un folder node dans le bin:
 * - ".trash" => shouldRender=false
 * - "<trashId>" => label=displayName
 * - autre => label=folder.name
 */
export function getBinFolderLabel(params: {
  folderName: string;
  folderFullPath: string;
  trashMap: TrashMap;
}): { shouldRender: boolean; label: string } {
  const { folderName, folderFullPath, trashMap } = params;

  if (folderName === ".trash") return { shouldRender: false, label: folderName };

  const trashId = getTrashIdFromStoragePath(folderFullPath);
  if (trashId && folderName === trashId) {
    const entry = trashMap.get(trashId);
    return { shouldRender: true, label: entry?.displayName ?? "Élément supprimé" };
  }

  return { shouldRender: true, label: folderName };
}