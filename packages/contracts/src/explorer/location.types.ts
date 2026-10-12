/**
 * ExplorerLocation
 *
 * Localisation UI unifiée pour une instance d'explorateur.
 * IMPORTANT: ceci n'est pas forcément un chemin de stockage réel.
 *
 * - kind:"path"        => navigation normale (préfixe de stockage réel)
 * - kind:"bin-root"    => liste plate de TrashEntry (AKFC/bin)
 * - kind:"trash-folder"=> navigation VIRTUELLE à l'intérieur d'un TrashEntry folder
 */
export type ExplorerLocation =
  | {
      kind: "path";
      /** Préfixe de stockage réel (ex: "AKFC/cours") */
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
       * NOTE: Ceci n'existe pas comme "dossier" de stockage ; on l'utilise pour lister sous storageRoot.
       */
      relativePath: string;
    };