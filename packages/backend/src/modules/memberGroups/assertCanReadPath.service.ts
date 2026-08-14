import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  if (user?.role?.name === "ADMIN") return;

  const groupId = groupIdFromLogicalPath(path);
  if (!groupId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès refusé à ce dossier.",
    });
  }

  const membership = await prisma.memberGroupMembership.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { access: true },
  });
  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès refusé à ce dossier.",
    });
  }
}
