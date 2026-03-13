import type { TrashEntryDTO, TrashEntryKind } from "./trash.dto";

/**
 * Mutations corbeille
 *
 * Règles:
 * - trash: normal -> bin (création TrashEntry + move vers storageRoot caché)
 * - restore: bin -> previousPath (toujours) + auto-rename si collision (toujours)
 * - deleteForever: suppression définitive (storageRoot + DB)
 */

export type TrashToBinInput = {
  appRoot: string;
  sources: Array<
    | { kind: "folder"; fullPath: string }
    | { kind: "file"; fullPath: string }
    | { kind: "selection"; roots: string[] } // roots explicites uniquement
  >;
};

export type TrashToBinOutput = {
  trashed: TrashEntryDTO[];
  message?: string;
};

export type RestoreFromBinInput = {
  appRoot: string;
  ids: string[]; // trashId[]
};

export type RestoreResultItem = {
  id: string; // trashId
  kind: TrashEntryKind;

  displayName: string;
  previousPath: string;

  /**
   * Chemin final (collision => renommé avec trashedAt)
   * - si pas de collision: restoredToPath === previousPath
   */
  restoredToPath: string;

  /**
   * true si collision détectée et renommage appliqué
   */
  wasCollision: boolean;

  /**
   * Pour l'historique UI:
   * "AKFC/... restauré à AKFC/... (bin 2026-02-22 18-12)"
   */
  trashedAt: string; // ISO

  renameReason?: "COLLISION";
};

export type RestoreFromBinOutput = {
  restored: RestoreResultItem[];
};

export type DeleteForeverInput = {
  appRoot: string;
  ids: string[];
};

export type DeleteForeverOutput = {
  deletedIds: string[];
};