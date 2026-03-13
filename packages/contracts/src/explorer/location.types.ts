/**
 * ExplorerLocation
 *
 * Localisation UI unifiée pour une instance d'explorateur.
 * IMPORTANT: ceci n'est pas forcément un path Cloudinary réel.
 *
 * - kind:"path"        => navigation normale (Cloudinary prefix réel)
 * - kind:"bin-root"    => liste plate de TrashEntry (AKFC/bin)
 * - kind:"trash-folder"=> navigation VIRTUELLE à l'intérieur d'un TrashEntry folder
 */
export type ExplorerLocation =
  | {
      kind: "path";
      /** Chemin réel Cloudinary prefix (ex: "AKFC/pending/cours") */
      path: string;
    }
  | {
      kind: "bin-root";
      /** App root (ex: "AKFC") */
      appRoot: string;
    }
  | {
      kind: "trash-folder";
      appRoot: string; // "AKFC"
      trashId: string;
      /** Nom affiché du root (ex: "cours1") */
      displayName: string;

      /**
       * Chemin RELATIF à l'intérieur de ce TrashFolder.
       * - "" => racine du contenu trash
       * - "subA/subB"
       *
       * NOTE: Ceci n'existe pas comme "dossier" Cloudinary; on l'utilise pour lister sous storageRoot.
       */
      relativePath: string;
    };