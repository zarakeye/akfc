/**
 * Preview (global wrapper)
 *
 * Un seul rail de preview commun aux 2 panels.
 * readOnly dépend de la provenance de l'item:
 * - si l'item vient du bin (trash) => readOnly true
 * - sinon => readOnly false
 */

export type PreviewOrigin =
  | { kind: "normal"; fullPath: string }
  | {
      kind: "trash";
      trashId: string;
      /** Path virtuel (affichage) */
      virtualFullPath: string;
      /** Chemin d'origine (tooltip) */
      previousPath: string;
      trashedAt: string; // ISO
    };

export type PreviewItem =
  | {
      type: "file";
      name: string;
      url: string;

      sizeBytes?: number;
      createdAt?: string;

      origin: PreviewOrigin;
    }
  | {
      type: "folder";
      name: string;
      origin: PreviewOrigin;
    };

export type PreviewState = {
  isOpen: boolean;
  item: PreviewItem | null;

  /**
   * readOnly: true si origin.kind==="trash"
   * C'est LE point que tu as demandé.
   */
  readOnly: boolean;
};