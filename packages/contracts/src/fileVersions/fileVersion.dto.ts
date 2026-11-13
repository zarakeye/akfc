/**
 * Versions d'un fichier de la bibliothèque (fileVersion.list) : le contenu actuel, puis les
 * anciennes versions, de la plus récente à la plus ancienne.
 */

/** Conservation : les 10 plus récentes de chaque fichier… */
export const FILE_VERSIONS_KEPT = 10;
/** … et pas plus d'un an. */
export const FILE_VERSION_MAX_AGE_DAYS = 365;

export type FileVersionDTO = {
  id: string;
  originalFileName: string;
  mimeType: string;
  bytes: number;
  /** Qui avait déposé ce contenu (null : inconnu, ou compte supprimé). */
  authorName: string | null;
  /** Quand ce contenu avait été déposé. */
  uploadedAt: string;
  /** Quand il a été remplacé. */
  replacedAt: string;
};

export type FileVersionsOutput = {
  mediaAssetId: string;
  fullPath: string;
  current: {
    originalFileName: string;
    mimeType: string;
    bytes: number;
    authorName: string | null;
    uploadedAt: string;
  };
  versions: FileVersionDTO[];
  /** Vrai si l'utilisateur peut restaurer une version (admin, ou éditeur de l'espace du groupe). */
  canRestore: boolean;
  /** Vrai si l'utilisateur peut supprimer une version (admin). */
  canDelete: boolean;
};
