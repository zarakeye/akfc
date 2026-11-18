import type { PrismaClient } from "@prisma/client";

import { ensureGroupSpaceFolder } from "#modules/memberGroups/ensureGroupSpaceFolder.service.ts";
import type { CreateGroupInput } from "@akfc/contracts/groups/createGroup.schema.ts";

/**
 * Crée un groupe de membres. Deux entrées l'appellent : la procédure tRPC memberGroup.create
 * (tests, future application mobile) et la server action du formulaire du panneau de contrôle.
 * Toutes deux ont vérifié, avant, que l'appelant est administrateur.
 */
export async function createMemberGroup(
  db: PrismaClient,
  input: CreateGroupInput & { appRoot: string },
): Promise<{ id: string }> {
  // Règle « Administrateurs ancêtre de tout » : sans parent explicite,
  // le nouveau groupe est rattaché au groupe Administrateurs.
  const parentGroupId =
    input.parentGroupId ??
    (
      await db.memberGroup.findFirst({
        where: { isAdminGroup: true },
        select: { id: true },
      })
    )?.id ??
    null;

  const group = await db.memberGroup.create({
    data: {
      name: input.name,
      description: input.description,
      isCollaborative: input.isCollaborative ?? false,
      parentGroupId,
    },
    select: { id: true },
  });
  // Un groupe collaboratif a son espace : un dossier, créé tout de suite.
  if (input.isCollaborative) {
    await ensureGroupSpaceFolder({
      prisma: db,
      appRoot: input.appRoot,
      groupId: group.id,
    });
  }
  return { id: group.id };
}
