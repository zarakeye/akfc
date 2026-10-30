import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";
import { groupIdFromLogicalPath } from "@backend/modules/memberGroups/assertCanTrashPaths.service";

/**
 * Garde d'ÉCRITURE du finder (renommer, déplacer, changer un libellé) : un ADMIN écrit partout ;
 * un non-admin seulement dans l'espace d'un groupe collaboratif dont il est ÉDITEUR. C'est la règle
 * de la mise à la corbeille, appliquée à toutes les modifications.
 *
 * Pour un déplacement, l'appelant passe la SOURCE et la CIBLE : un éditeur ne doit ni sortir un
 * fichier de son espace, ni en faire entrer un pris ailleurs.
 */
export async function assertCanWritePaths(params: {
  prisma: PrismaClient;
  userId: string;
  paths: readonly string[];
}): Promise<void> {
  const { prisma, userId, paths } = params;

  if (await isAdminByGroup(prisma, userId)) return;

  // Un accès par groupe, pas par chemin : une sélection de cinquante fichiers d'un même espace
  // ne coûte qu'une requête.
  const accessByGroup = new Map<string, string>();
  for (const path of paths) {
    const groupId = groupIdFromLogicalPath(path);
    if (!groupId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Modification hors espace de groupe réservée aux administrateurs.",
      });
    }
    let access = accessByGroup.get(groupId);
    if (access === undefined) {
      access = await resolveGroupAccessForUser(prisma, userId, groupId);
      accessByGroup.set(groupId, access);
    }
    if (access !== "EDITOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Modification réservée aux éditeurs de ce groupe.",
      });
    }
  }
}
