/**
 * binDisplayPath.ts
 *
 * Objectif:
 * - Cacher l'implémentation technique de la corbeille:
 *   AKFC/bin/.trash/<trashId>/...
 * - Afficher à la place:
 *   AKFC/bin/<displayName>/...  (displayName dérivé du previousPath)
 *
 * On ne touche PAS aux fullPath techniques (utilisés pour les appels backend),
 * on change uniquement l'affichage (Tree, Breadcrumb, Grid, Tooltip).
 */

export type TrashEntryMini = {
  id: string; // trashId
  previousPath: string;
};

export type TrashEntryDisplay = {
  id: string;
  previousPath: string;
  displayName: string; // basename(previousPath)
};

export function basenamePath(p: string): string {
  const parts = p.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  return parts[parts.length - 1] ?? p;
}

export function isTrashStoragePath(fullPath: string): boolean {
  return fullPath.includes("/bin/.trash/");
}

export function isTrashDotFolderNodeName(name: string): boolean {
  return name === ".trash";
}

/**
 * Extrait le trashId depuis un chemin storage:
 * AKFC/bin/.trash/<trashId>/...
 */
export function getTrashIdFromStoragePath(fullPath: string): string | null {
  const normalized = fullPath.replace(/^\/+|\/+$/g, "");
  const parts = normalized.split("/").filter(Boolean);

  // attendu: [AKFC, bin, .trash, <trashId>, ...]
  const idx = parts.indexOf(".trash");
  if (idx === -1) return null;

  const trashId = parts[idx + 1];
  return trashId ?? null;
}

export function buildTrashEntryDisplayMap(entries: TrashEntryMini[]): Map<string, TrashEntryDisplay> {
  const map = new Map<string, TrashEntryDisplay>();
  for (const e of entries) {
    map.set(e.id, {
      id: e.id,
      previousPath: e.previousPath,
      displayName: basenamePath(e.previousPath),
    });
  }
  return map;
}

/**
 * Convertit un "segment" affiché (nom de folder dans le tree) pour bin:
 * - ".trash" doit être caché
 * - "<trashId>" devient displayName
 */
export function getBinDisplayLabel(params: {
  nodeName: string; // segment
  nodeFullPath: string; // fullPath technique
  trashMap: Map<string, TrashEntryDisplay>;
}): { shouldRender: boolean; label: string } {
  const { nodeName, nodeFullPath, trashMap } = params;

  // Cacher le dossier technique .trash
  if (isTrashDotFolderNodeName(nodeName)) return { shouldRender: false, label: nodeName };

  // Si on est dans un storage trash, renommer le trashId
  const trashId = getTrashIdFromStoragePath(nodeFullPath);
  if (trashId && nodeName === trashId) {
    const entry = trashMap.get(trashId);
    return { shouldRender: true, label: entry?.displayName ?? "Élément supprimé" };
  }

  return { shouldRender: true, label: nodeName };
}

/**
 * Tooltip : si path en corbeille => montrer previousPath
 */
export function getBinTooltipTitle(params: {
  nodeFullPath: string; // fullPath technique
  trashMap: Map<string, TrashEntryDisplay>;
}): string {
  const { nodeFullPath, trashMap } = params;

  const trashId = getTrashIdFromStoragePath(nodeFullPath);
  if (!trashId) return nodeFullPath;

  const entry = trashMap.get(trashId);
  return entry?.previousPath ?? nodeFullPath;
}