import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import type { PrismaClient } from "@prisma/client";

import type {
  ListResult,
  StorageFolderNode,
  StorageNode,
} from "@contracts/storage";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";
import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";

/**
 * Espaces de groupe ET perso visibles même VIDES.
 *
 * Cloudinary/R2 n'ont pas de vrais dossiers : un espace sans asset s'évapore du
 * listing, alors que le groupe / l'utilisateur existe toujours. On réinjecte
 * les espaces connus. Deux points : `list` (groupes, liste plate) et `getTree`
 * (groupes + persos, arbre lu par le finder).
 *
 * Dédup par le suffixe STABLE `-<id>` (robuste au renommage). Le physique prime.
 */

async function collaborativeGroupIds(
  prisma: PrismaClient,
  userId: string,
): Promise<string[]> {
  const isAdmin = await isAdminByGroup(prisma, userId);
  return isAdmin
    ? (
        await prisma.memberGroup.findMany({
          where: { isCollaborative: true },
          select: { id: true },
        })
      ).map((g) => g.id)
    : (await collaborativeEntriesForMember(prisma, userId)).map((e) => e.groupId);
}

function folderNode(path: string): StorageFolderNode {
  return {
    type: "folder",
    name: path.slice(path.lastIndexOf("/") + 1),
    path,
    hasChildren: false,
  };
}

/** Espaces de GROUPE manquants parmi `existingPaths`. */
async function missingGroupSpaceFolders(params: {
  existingPaths: ReadonlyArray<string>;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<StorageFolderNode[]> {
  const { existingPaths, prisma, appRoot, userId } = params;
  const groupIds = await collaborativeGroupIds(prisma, userId);
  const extra: StorageFolderNode[] = [];
  for (const groupId of groupIds) {
    if (existingPaths.some((p) => p.endsWith(`-${groupId}`))) continue;
    try {
      extra.push(folderNode(await resolveGroupBaseFolder({ prisma, appRoot, groupId })));
    } catch {
      // groupe disparu entre deux requêtes : ignoré.
    }
  }
  return extra;
}

/** Espace PERSO de l'utilisateur courant, s'il manque. */
async function missingPersoSpaceFolders(params: {
  existingPaths: ReadonlyArray<string>;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<StorageFolderNode[]> {
  const { existingPaths, prisma, appRoot, userId } = params;
  if (existingPaths.some((p) => p.endsWith(`-${userId}`))) return [];
  try {
    return [folderNode(await resolvePersoBaseFolder({ prisma, appRoot, userId }))];
  } catch {
    return [];
  }
}

/** Variante `list` : groupes uniquement (le finder n'utilise pas `list`). */
export async function mergeGroupSpaceFolders(params: {
  result: ListResult;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<ListResult> {
  const { result, prisma, appRoot, userId } = params;
  const extra = await missingGroupSpaceFolders({
    existingPaths: result.folders.map((f) => f.path),
    prisma,
    appRoot,
    userId,
  });
  if (extra.length === 0) return result;
  return { ...result, folders: [...result.folders, ...extra] };
}

/** Variante `getTree` : réinjecte dans les nœuds conteneurs `groups` ET `persos`. */
export async function mergeGroupSpaceFoldersIntoTree(params: {
  root: StorageFolderNode;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<StorageFolderNode> {
  const { root, prisma, appRoot, userId } = params;
  const groupsPath = `${appRoot}/collaborative-group-spaces`;
  const persosPath = `${appRoot}/personal-spaces`;

  let groupsNode: StorageFolderNode | null = null;
  let persosNode: StorageFolderNode | null = null;
  const find = (n: StorageNode): void => {
    if (n.type !== "folder") return;
    if (n.path === groupsPath && n.children) groupsNode = n;
    if (n.path === persosPath && n.children) persosNode = n;
    (n.children ?? []).forEach(find);
  };
  find(root);

  // Dépôt commun : racine toujours visible (carte mentale admin), même vide.
  const commonRepoPath = `${appRoot}/common-repository`;
  let hasCommonRepo = false;
  const findCommon = (n: StorageNode): void => {
    if (n.type !== "folder") return;
    if (n.path === commonRepoPath || n.path.endsWith("/common-repository")) {
      hasCommonRepo = true;
    }
    (n.children ?? []).forEach(findCommon);
  };
  findCommon(root);
  const injectCommonRepo =
    !hasCommonRepo && (await isAdminByGroup(prisma, userId));

  const groupExtra = groupsNode
    ? await missingGroupSpaceFolders({
        existingPaths: (groupsNode as StorageFolderNode).children?.map((c) => c.path) ?? [],
        prisma,
        appRoot,
        userId,
      })
    : [];
  const persoExtra = persosNode
    ? await missingPersoSpaceFolders({
        existingPaths: (persosNode as StorageFolderNode).children?.map((c) => c.path) ?? [],
        prisma,
        appRoot,
        userId,
      })
    : [];
  if (
    groupExtra.length === 0 &&
    persoExtra.length === 0 &&
    !injectCommonRepo
  )
    return root;

  const rebuild = (n: StorageNode): StorageNode => {
    if (n.type !== "folder") return n;
    if (n.path === groupsPath && n.children && groupExtra.length > 0) {
      return { ...n, children: [...n.children, ...groupExtra] };
    }
    if (n.path === persosPath && n.children && persoExtra.length > 0) {
      return { ...n, children: [...n.children, ...persoExtra] };
    }
    if (!n.children) return n;
    return { ...n, children: n.children.map(rebuild) };
  };
  let rebuilt = rebuild(root) as StorageFolderNode;
  if (injectCommonRepo) {
    rebuilt = {
      ...rebuilt,
      hasChildren: true,
      children: [...(rebuilt.children ?? []), folderNode(commonRepoPath)],
    };
  }
  return rebuilt;
}
