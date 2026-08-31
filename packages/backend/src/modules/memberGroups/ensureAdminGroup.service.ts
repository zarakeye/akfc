import type { PrismaClient } from "@prisma/client";

import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";

const ADMIN_GROUP_NAME = "Administrateurs";

/**
 * Garantit le groupe « Administrateurs » UNIQUE (collaboratif, isAdminGroup),
 * y inscrit tous les utilisateurs de rôle ADMIN en EDITOR, et matérialise son
 * espace. Idempotent — appelé au boot.
 *
 * NB : le DÉPLACEMENT de l'ex-dossier « general » dans cet espace est une étape
 * SÉPARÉE (déplacement de données, avec sauvegarde) — pas ici.
 */
export async function ensureAdminGroup(
  prisma: PrismaClient,
  appRoot: string,
): Promise<{ groupId: string }> {
    let group = await prisma.memberGroup.findFirst({
    where: { isAdminGroup: true },
    select: { id: true },
  });

  if (!group) {
    group = await prisma.memberGroup.create({
      data: {
        name: ADMIN_GROUP_NAME,
        isCollaborative: true,
        isAdminGroup: true,
      },
      select: { id: true },
    });
  }

  await ensureGroupSpaceFolder({ prisma, appRoot, groupId: group.id });

  return { groupId: group.id };
}
