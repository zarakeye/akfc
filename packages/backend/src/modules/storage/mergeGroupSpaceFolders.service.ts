import type { PrismaClient } from "@prisma/client";

import type { ListResult, StorageFolderNode } from "@contracts/storage";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";

/**
 * Réinjecte, dans le listing du conteneur `groups`, les espaces des groupes
 * COLLABORATIFS connus en base — même vides.
 *
 * Cloudinary/R2 n'ont pas de vrais dossiers : un espace sans aucun asset
 * n'existe pas physiquement et s'évapore du listing. On rétablit la vérité en
 * fusionnant les dossiers dérivés de la base avec le résultat physique.
 *
 * Déduplication par le suffixe STABLE `-<groupId>` (et non le chemin complet) :
 * un groupe renommé a un dossier physique à l'ancien slug mais toujours le même
 * `-<groupId>` → on ne le réinjecte pas en double.
 *
 * Visibilité : admin → tous les groupes collaboratifs ; membre → ses espaces
 * accessibles. Le physique prime (aucun doublon).
 */
export async function mergeGroupSpaceFolders(params: {
  result: ListResult;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<ListResult> {
  const { result, prisma, appRoot, userId } = params;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  const isAdmin = me?.role?.name === "ADMIN";

  const groupIds = isAdmin
    ? (
        await prisma.memberGroup.findMany({
          where: { isCollaborative: true },
          select: { id: true },
        })
      ).map((g) => g.id)
    : (await collaborativeEntriesForMember(prisma, userId)).map((e) => e.groupId);

  if (groupIds.length === 0) return result;

  const physicalPaths = result.folders.map((f) => f.path);
  const extra: StorageFolderNode[] = [];

  for (const groupId of groupIds) {
    // Déjà présent physiquement (même à un ancien slug) → on ne double pas.
    if (physicalPaths.some((p) => p.endsWith(`-${groupId}`))) continue;
    try {
      const path = await resolveGroupBaseFolder({ prisma, appRoot, groupId });
      extra.push({
        type: "folder",
        name: path.slice(path.lastIndexOf("/") + 1),
        path,
        hasChildren: false,
      });
    } catch {
      // Groupe disparu entre les deux requêtes : on l'ignore.
    }
  }

  if (extra.length === 0) return result;
  return { ...result, folders: [...result.folders, ...extra] };
}
