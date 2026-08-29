import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";
import { groupIdFromLogicalPath } from "@backend/modules/memberGroups/assertCanTrashPaths.service";

/**
 * Garde de LECTURE du finder : un ADMIN lit partout ; un non-admin ne peut lire
 * QUE dans l'espace d'un groupe collaboratif dont il est MEMBRE (VIEWER ou
 * EDITOR — la consultation est ouverte aux deux). Tout chemin hors d'un espace
 * de groupe (racine, `groups` nu, general, perso, disciplines, autre groupe)
 * est refusé (FORBIDDEN) pour un non-admin.
 */
export async function assertCanReadPath(params: {
  prisma: PrismaClient;
  userId: string;
  path: string;
}): Promise<void> {
  const { prisma, userId, path } = params;

  if (await isAdminByGroup(prisma, userId)) return;

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
