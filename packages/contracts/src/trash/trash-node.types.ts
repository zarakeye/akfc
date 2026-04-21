/**
 * Nodes "trash mode"
 *
 * On réutilise la sémantique folder/file, mais les fullPath sont VIRTUELS,
 * construits pour l'affichage (breadcrumb, title etc.).
 *
 * Le backend sait faire la correspondance via trashId + relativePath -> storageRoot réel.
 */

export type TrashMeta = {
  kind: "trash";
  trashId: string;
  previousPath: string;
  trashedAt: string; // ISO
};

export type TrashFolderNode = {
  type: "folder";
  name: string;

  /**
   * FullPath VIRTUEL pour l'UI:
   * "AKFC/bin/<displayName>/<relativePath>/<name>"
   */
  fullPath: string;

  children: Array<TrashFolderNode | TrashFileNode>;
  meta: TrashMeta;
};

export type TrashFileNode = {
  type: "file";
  name: string;

  /** FullPath VIRTUEL */
  fullPath: string;

  /** Identité Cloudinary de lecture */
  publicId: string;

  /**
   * Métadonnées utiles côté UI (facultatives mais pratiques)
   */
  sizeBytes?: number;
  createdAt?: string;

  meta: TrashMeta;
};

export type ReadTrashFolderInput = {
  appRoot: string; // "AKFC"
  trashId: string;
  /** "" ou "subA/subB" */
  relativePath?: string;
};

export type ReadTrashFolderOutput = {
  folder: TrashFolderNode;
  /** ex: "AKFC/bin/cours1/subA" (virtuel) */
  displayPath: string;
};