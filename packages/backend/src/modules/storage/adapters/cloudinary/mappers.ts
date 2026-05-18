import type {
  FolderNode as CloudinaryFolderNode,
  FileNode as CloudinaryFileNode,
} from "@contracts/cloudinary/finder.types";

import type {
  StorageNode,
  StorageFolderNode,
  StorageFileNode,
  StorageMetadata,
} from "@contracts/storage";

/**
 * Mapping Cloudinary client-shape → contrat storage agnostique.
 *
 * Le service `getCloudinaryFolderTree` produit un `FolderNode` Cloudinary
 * (forme historique avec `fullPath`, `children`, etc.). Pour servir le
 * contrat agnostique, on traduit cette forme en `StorageNode` neutre.
 *
 * La traduction est mécanique mais elle gère un point essentiel : la
 * **gestion du `depth`** pour `getTree`. À profondeur max, on coupe les
 * `children` en mettant `undefined` (pas `[]`) — ce qui signale au
 * consommateur "non chargé" plutôt que "vide".
 */

/**
 * Mappe récursivement un `FolderNode` Cloudinary vers un `StorageNode`
 * agnostique, en respectant la profondeur demandée.
 *
 * @param tree   Le folder Cloudinary à mapper (typiquement la racine).
 * @param depth  Nombre de niveaux d'enfants à charger.
 *               - `0` : le folder lui-même, sans enfants (children: undefined)
 *               - `1` : enfants directs chargés, mais leurs propres enfants
 *                      restent non chargés (children: undefined sur les sous-folders)
 *               - `N` : descend N niveaux
 */
export function mapClientFolderTreeToStorageNode(
  tree: CloudinaryFolderNode,
  depth: number
): StorageNode {
  return mapNode(tree, depth);
}

function mapNode(
  node: CloudinaryFolderNode | CloudinaryFileNode,
  depth: number
): StorageNode {
  if (node.type === "file") {
    return mapFile(node);
  }
  return mapFolder(node, depth);
}

function mapFolder(
  folder: CloudinaryFolderNode,
  depth: number
): StorageFolderNode {
  const hasChildren = (folder.children?.length ?? 0) > 0;

  // À profondeur 0, on ne charge pas les enfants (children reste undefined).
  // hasChildren reste rempli pour informer la TreeView qu'il y a quelque chose.
  if (depth <= 0) {
    return {
      type: "folder",
      name: folder.name,
      path: folder.fullPath,
      hasChildren,
    };
  }

  // À profondeur > 0, on descend dans les enfants en décrémentant.
  const children = (folder.children ?? []).map((child) =>
    mapNode(child, depth - 1)
  );

  return {
    type: "folder",
    name: folder.name,
    path: folder.fullPath,
    children,
    hasChildren,
  };
}

function mapFile(file: CloudinaryFileNode): StorageFileNode {
  return {
    type: "file",
    name: file.name,
    path: file.publicId,
    metadata: cloudinaryFileToMetadata(file),
  };
}

function cloudinaryFileToMetadata(file: CloudinaryFileNode): StorageMetadata {
  // FileNode Cloudinary porte `kind`, `url`, `format` (cf. finder.types.ts).
  // On translate ce qui est neutre vers StorageMetadata. `kind` et `url`
  // sont des notions qui n'ont pas leur place dans `StorageMetadata` —
  // un adapter frontend qui les veut peut les recalculer (kind depuis
  // format, url via getMediaUrl).
  return {
    format: file.format,
  };
}
