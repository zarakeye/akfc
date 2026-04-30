import type {
  CloudinaryFolderNode,
} from "@contracts/cloudinary/tree.contract.v1";

interface FlatResource {
  publicId: string;
  url: string;
}

/**
 * Build "Finder Tree" (V1)
 * - Base: dossiers venant de la DB (même vides)
 * - + Injection: fichiers venant de Cloudinary (resources)
 */

/**
 * Builds the "Finder Tree" (V1) by combining the registered folder paths
 * from the DB with the resources from Cloudinary.
 *
 * @param resources A list of resources from Cloudinary
 * @param registeredFolderPaths A list of folder paths registered in the DB
 * @param rootPath The root path of the tree
 * @returns The root of the Finder Tree
 */
export function buildCloudinaryTree(
  resources: FlatResource[],
  registeredFolderPaths: string[],
  rootPath: string
): CloudinaryFolderNode {
  const root: CloudinaryFolderNode = {
    type: "folder",
    name: rootPath.split("/").pop()!,
    path: rootPath,
    children: [],
  };

  /**
   * Ensures that the given absolute folder path exists in the tree.
   *
   * @param absoluteFolderPath - The absolute folder path to ensure
   *
   * This function will create all necessary intermediate folders in the tree
   * if they do not already exist.
   */
  const ensureFolder = (absoluteFolderPath: string) => {
    if (absoluteFolderPath === rootPath) return;

    const relative = absoluteFolderPath.replace(`${rootPath}/`, "");
    const parts = relative.split("/").filter(Boolean);

    let current = root;

    for (const part of parts) {
      let next = current.children.find(
        (c): c is CloudinaryFolderNode => c.type === "folder" && c.name === part
      );

      if (!next) {
        next = {
          type: "folder",
          name: part,
          path: `${current.path}/${part}`,
          children: [],
        };
        current.children.push(next);
      }

      current = next;
    }
  };

  // 1) Créer d’abord tous les dossiers enregistrés en DB (y compris vides)
  for (const folderPath of registeredFolderPaths) {
    if (folderPath === rootPath) continue;
    if (!folderPath.startsWith(rootPath)) continue;
    ensureFolder(folderPath);
  }

  // 2) Injecter ensuite les fichiers Cloudinary (et créer les dossiers au passage si manquants)
  for (const resource of resources) {
    const relativePath = resource.publicId.replace(`${rootPath}/`, "");
    const parts = relativePath.split("/").filter(Boolean);

    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;

      if (isFile) {
        // éviter les doublons
        const already = current.children.find(
          (c) => c.type === "file" && (c).publicId === resource.publicId
        );
        if (!already) {
          current.children.push({
            type: "file",
            name: part,
            publicId: resource.publicId,
            url: resource.url,
          });
        }
        return;
      }

      let folder = current.children.find(
        (c): c is CloudinaryFolderNode => c.type === "folder" && c.name === part
      );

      if (!folder) {
        folder = {
          type: "folder",
          name: part,
          path: `${current.path}/${part}`,
          children: [],
        };
        current.children.push(folder);
      }

      current = folder;
    });
  }

  return root;
}