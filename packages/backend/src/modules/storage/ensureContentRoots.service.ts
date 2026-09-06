import type { PrismaClient } from "@prisma/client";
import type { StorageFolderNode } from "@contracts/storage";
import { categoryStorageSegment } from "@backend/modules/cloudinary/services/categoryStorageSegment";

/**
 * Racines principales du finder — celles qui REÇOIVENT le contenu — qui doivent
 * apparaître dès le premier rendu, même vides (Cloudinary/R2 n'ont pas de vrais
 * dossiers vides). Chemin physique EN ; l'affichage humain est résolu ensuite
 * par les FolderLabel (applyGroupSpaceNames).
 */
export async function requiredRootPaths(
  prisma: PrismaClient,
  appRoot: string,
): Promise<string[]> {
  const categories = await prisma.category.findMany({ select: { type: true } });
  return [
    ...categories.map((c) => `${appRoot}/${categoryStorageSegment(c.type)}`),
    `${appRoot}/seminars`,
    `${appRoot}/events`,
    `${appRoot}/personal-spaces`,
    `${appRoot}/collaborative-group-spaces`,
    `${appRoot}/common-repository`,
  ];
}

function emptyRootNode(path: string): StorageFolderNode {
  return {
    type: "folder",
    name: path.slice(path.lastIndexOf("/") + 1),
    path,
    hasChildren: false,
    children: [],
  };
}

/** getTree : complète les enfants directs de la racine avec celles qui manquent. */
export async function ensureContentRootsInTree(
  root: StorageFolderNode,
  prisma: PrismaClient,
  appRoot: string,
): Promise<StorageFolderNode> {
  const required = await requiredRootPaths(prisma, appRoot);
  const present = new Set((root.children ?? []).map((c) => c.path));
  const missing = required.filter((p) => !present.has(p)).map(emptyRootNode);
  if (missing.length === 0) return root;
  return {
    ...root,
    hasChildren: true,
    children: [...(root.children ?? []), ...missing],
  };
}

/** list à la racine : les dossiers des racines manquantes parmi `existingPaths`. */
export async function missingContentRootFolders(
  existingPaths: ReadonlyArray<string>,
  prisma: PrismaClient,
  appRoot: string,
): Promise<StorageFolderNode[]> {
  const required = await requiredRootPaths(prisma, appRoot);
  const present = new Set(existingPaths);
  return required.filter((p) => !present.has(p)).map(emptyRootNode);
}
