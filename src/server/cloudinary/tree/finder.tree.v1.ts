import type {
  CloudinaryFolderNode,
} from "@server/contracts/cloudinary/tree.contract.v1";

interface FlatResource {
  publicId: string;
  url: string;
}

/**
 * Build "Finder Tree" (V1)
 * - Base: dossiers venant de la DB (même vides)
 * - + Injection: fichiers venant de Cloudinary (resources)
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