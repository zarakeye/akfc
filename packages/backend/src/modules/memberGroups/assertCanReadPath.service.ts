import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";
import { groupIdFromLogicalPath, personalSpaceOwnerId } from "@backend/modules/memberGroups/assertCanTrashPaths.service";

/**
 * Garde de LECTURE du finder : un ADMIN lit partout ; un non-admin ne peut lire
 * QUE son propre espace personnel, et l'espace d'un groupe collaboratif dont il
 * est MEMBRE (VIEWER ou EDITOR — la consultation est ouverte aux deux). Tout
 * autre chemin (racine, conteneurs, dépôt commun, disciplines, espace d'un autre
 * membre ou d'un autre groupe) est refusé (FORBIDDEN) pour un non-admin. Le
 * chemin est lu par position (groupIdFromLogicalPath, personalSpaceOwnerId).
 */
export async function assertCanReadPath(params: {
  prisma: PrismaClient;
  userId: string;
  path: string;
}): Promise<void> {
  const { prisma, userId, path } = params;

  if (await isAdminByGroup(prisma, userId)) return;
  // Son propre espace personnel (même règle que la livraison des fichiers, canReadStorageKey).
  if (personalSpaceOwnerId(path) === userId) return;

  const groupId = groupIdFromLogicalPath(path);
  if (!groupId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès refusé à ce dossier.",
    });
  }

  const access = await resolveGroupAccessForUser(prisma, userId, groupId);
  if (access === "NONE") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès refusé à ce dossier.",
    });
  }
}
