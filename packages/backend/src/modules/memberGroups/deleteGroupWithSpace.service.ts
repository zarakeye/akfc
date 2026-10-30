import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { isSpaceEmpty } from "@backend/modules/storage/isSpaceEmpty.service";
import { groupIdFromLogicalPath } from "@backend/modules/memberGroups/assertCanTrashPaths.service";

/**
 * Supprime un groupe et son espace, en cascade SÛRE (décisions A→E) :
 *  - refuse le groupe Administrateurs (isAdminGroup) ;
 *  - l'espace doit être VIDE — contrôle PHYSIQUE (isSpaceEmpty), aligné sur ce
 *    que montre le finder (les lignes MediaAsset orphelines ne faussent rien) ;
 *    layout plat → les espaces enfants (dossiers frères) ne comptent pas ;
 *  - les groupes enfants sont RE-PARENTÉS vers le parent du groupe supprimé
 *    (au pire Administrateurs) AVANT le delete, pour éviter le SetNull racine.
 *
 * Chemin d'espace résolu par le SUFFIXE `-{groupId}` du registre (stable au
 * renommage), repli sur le chemin canonique.
 */
export async function deleteGroupWithSpace(params: {
  prisma: PrismaClient;
  appRoot: string;
  groupId: string;
}): Promise<void> {
  const { prisma, appRoot, groupId } = params;

  const group = await prisma.memberGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      isAdminGroup: true,
      isCollaborative: true,
      parentGroupId: true,
    },
  });
  if (!group) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Groupe introuvable." });
  }
  if (group.isAdminGroup) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Le groupe Administrateurs ne peut pas être supprimé.",
    });
  }

  // Chemin(s) de l'espace : suffixe -{groupId} (robuste au renommage).
  const registered = await prisma.folder.findMany({
    where: { appRoot, fullPath: { endsWith: `-${groupId}` } },
    select: { fullPath: true },
  });
  const spacePaths = new Set<string>(
    // L'espace lui-même, lu par position : `<racine>/collaborative-group-spaces/<slug>-<groupId>`
    // (trois segments). Un dossier homonyme rangé ailleurs, ou un sous-dossier, n'en est pas un.
    registered
      .map((r) => r.fullPath)
      .filter((fp) => groupIdFromLogicalPath(fp) === groupId && fp.split("/").filter(Boolean).length === 3),
  );
  if (spacePaths.size === 0 && group.isCollaborative) {
    try {
      spacePaths.add(await resolveGroupBaseFolder({ prisma, appRoot, groupId }));
    } catch {
      // non collaboratif / espace jamais matérialisé → rien à vérifier
    }
  }

  // Vérifie que chaque espace est VIDE (contrôle physique).
  for (const sp of spacePaths) {
    if (!(await isSpaceEmpty({ prisma, appRoot, path: sp }))) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `L'espace du groupe « ${group.name} » n'est pas vide. Videz-le (fichiers et sous-dossiers) avant de supprimer le groupe.`,
      });
    }
  }

  // Les trois écritures ensemble : des enfants re-parentés vers un groupe qui n'aurait finalement
  // pas été supprimé, ou un groupe supprimé avec ses enfants rattachés à rien, ne doivent pas exister.
  await prisma.$transaction([
    // Re-parente les enfants vers le parent (AVANT le delete).
    prisma.memberGroup.updateMany({
      where: { parentGroupId: groupId },
      data: { parentGroupId: group.parentGroupId },
    }),
    // Supprime les lignes de registre de l'espace (vide).
    prisma.folder.deleteMany({
      where: { appRoot, fullPath: { in: [...spacePaths] } },
    }),
    // Supprime le groupe (cascade DB : memberships + liens documents).
    prisma.memberGroup.delete({ where: { id: groupId } }),
  ]);
}
