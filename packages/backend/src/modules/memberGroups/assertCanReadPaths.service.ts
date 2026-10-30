import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";
import { groupIdFromLogicalPath, personalSpaceOwnerId } from "@backend/modules/memberGroups/assertCanTrashPaths.service";

/**
 * `assertCanReadPath` pour une LISTE de chemins (recherche, métadonnées d'une sélection) : même
 * règle — un administrateur lit partout, un membre dans son propre espace personnel et dans
 * l'espace d'un groupe dont il est membre —
 * avec un seul contrôle d'administration et un accès par groupe, quel que soit le nombre de chemins.
 */
export async function assertCanReadPaths(params: {
  prisma: PrismaClient;
  userId: string;
  paths: readonly string[];
}): Promise<void> {
  const { prisma, userId, paths } = params;
  if (paths.length === 0) return;
  if (await isAdminByGroup(prisma, userId)) return;

  const checked = new Set<string>();
  for (const path of paths) {
    if (personalSpaceOwnerId(path) === userId) continue;
    const groupId = groupIdFromLogicalPath(path);
    if (!groupId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Accès refusé à ce dossier." });
    }
    if (checked.has(groupId)) continue;
    const access = await resolveGroupAccessForUser(prisma, userId, groupId);
    if (access === "NONE") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Accès refusé à ce dossier." });
    }
    checked.add(groupId);
  }
}
