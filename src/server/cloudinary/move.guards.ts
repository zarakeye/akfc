import type { DragSource, MoveTarget } from "@/shared/cloudinary/move.types";

/**
 * ---------------------------------------------------------------------------
 * Type guards Source
 * ---------------------------------------------------------------------------
 */

/** ✅ file */
export const isFileSource = (s:DragSource): s is { type: 'file'; fullPath: string } => s.type === 'file';

/** ✅ folder */
export const isFolderSource = (s: DragSource): s is { type: 'folder'; fullPath: string } => s.type === 'folder';

/** ✅ selection */
export const isSelectionSource = (s: DragSource): s is { type: 'selection'; roots: string[]; excluded?: string[] } => s.type === 'selection';

/**
 * ---------------------------------------------------------------------------
 * Type guards Target
 * ---------------------------------------------------------------------------
 */

/** ✅ folder */
export const isFolderTarget = (t: MoveTarget): t is { type: 'folder'; fullPath: string } => t.type === 'folder';

/** ✅ virtual-folder */
export const isVirtualFolderTarget = (t: MoveTarget): t is { type: 'virtual-folder'; status: "pending" | "published" } => t.type === 'virtual-folder';

/**
 * ---------------------------------------------------------------------------
 * canMove
 * ---------------------------------------------------------------------------
 *
 * Action effectuée :
 * - Support du source.type === 'selection'
 * - Application des règles existantes sur chaque root sélectionné
 *
 * ⚠️ Note importante :
 * Le payload 'selection' ne contient pas le type (file/folder) de chaque root,
 * seulement des fullPath.
 * Donc, côté guard, on applique une règle conservatrice :
 * - si le target est un dossier réel
 * - et qu'il est égal à une root ou dans un descendant d'une root
 * => interdit (évite de drop un parent dans sa descendance)
 *
 * Cette approche est sûre : elle ne permet pas de move illégal.
 * Elle peut être légèrement plus stricte dans des cas rares (path ambigu),
 * mais c'est acceptable tant qu'on n'a pas un resolver vers l'arbre.
 */

export const canMove = (
  source: DragSource,
  target: MoveTarget
): boolean => {
  /**
   * -----------------------------------------------------------------------
   * 1) Cas selection
   * -----------------------------------------------------------------------
   */
  if (isSelectionSource(source)) {
    // Target virtual = OK (on ne peut pas être "descendant" d'un virtual)
    if (isVirtualFolderTarget(target)) {
      return true;
    }

    // Target folder : vérifier chaque root
    if (isFolderTarget(target)) {
      for (const root of source.roots) {
        // ❌ interdit : se dropper soi-même (root == target)
        if (target.fullPath === root) return false;

        // ❌ interdit : un dossier parent droppé dans un de ses descendants
        // (on traite root comme potentiellement un folder)
        if (target.fullPath.startsWith(root + "/")) return false;
      }

      return true;
    }

    return false;
  }

  /**
   * -----------------------------------------------------------------------
   * 2) Cas folder unitaire : règles existantes
   * -----------------------------------------------------------------------
   */

  // 1. ❌ interdit : se dropper soi-même
  if (isFolderSource(source) && isFolderTarget(target) && source.fullPath === target.fullPath) {
    return false;
  }

  // 2. ❌ interdit : un dossier dans un de ses sous-dossiers
  if (
    isFolderSource(source) &&
    isFolderTarget(target) &&
    target.fullPath.startsWith(source.fullPath + "/")
  ) {
    return false;
  }

  // 3. ✅ autorisé : autres cas
  // ✅ File → Folder
  if (isFileSource(source) && isFolderTarget(target)) return true;

  // ✅ File → Virtual Folder
  if (isFileSource(source) && isVirtualFolderTarget(target)) return true;

  // ✅ Folder → Folder
  if (isFolderSource(source) && isFolderTarget(target)) return true;

  // ✅ Folder → Virtual Folder
  if (isFolderSource(source) && isVirtualFolderTarget(target)) return true;

  return false;
};