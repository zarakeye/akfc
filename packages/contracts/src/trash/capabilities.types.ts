/**
 * Capabilities
 *
 * Permet d'avoir 2 panels identiques mais des capacités dynamiques selon la location.
 * Dans trash / bin => readOnly vrai, seules restore/deleteForever autorisées.
 */

export type ExplorerCapabilities = {
  /** L'UI peut activer le multi-select ? */
  canMultiSelect: boolean;

  /** Drag autorisé depuis la vue courante ? */
  canDrag: boolean;

  /** Drop autorisé sur les targets de la vue courante ? */
  canDrop: boolean;

  canRename: boolean;
  canDelete: boolean;

  /** Restore possible (bin root + trash folder) */
  canRestore: boolean;

  /** Delete définitif possible (bin root + trash folder) */
  canDeleteForever: boolean;

  /** Lecture seule */
  readOnly: boolean;
};