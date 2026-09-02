import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";
import { assertCanWriteGroupSpace } from "@backend/modules/memberGroups/assertCanWriteGroupSpace.service";
import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";

/**
 * Autorise (ou refuse) une destination d'upload selon l'utilisateur.
 *
 *   - group                     : droit d'écriture sur l'espace (assertCanWriteGroupSpace)
 *   - common_repository, perso  : tout utilisateur CONNECTÉ (perso = son propre
 *                                 espace, dérivé de son userId côté serveur)
 *   - existing/new-discipline,
 *     event                     : réservé aux ADMIN (contenus curatés)
 *
 * Défense en profondeur : l'UI membre ne proposera que `common_repository`, mais
 * ce garde empêche aussi un appel d'API forgé de viser une destination curatée.
 * Le `switch` est exhaustif sur l'union — un nouveau `kind` casserait le
 * typecheck (signal voulu).
 */
export async function assertUploadDestinationAllowed(params: {
  prisma: PrismaClient;
  userId: string;
  destination: UploadDestination;
}): Promise<void> {
  const { prisma, userId, destination } = params;
  switch (destination.kind) {
    case "group":
      await assertCanWriteGroupSpace({
        prisma,
        userId,
        groupId: destination.groupId,
      });
      return;
    case "common_repository":
    case "perso":
      return;
    case "existing-discipline":
    case "new-discipline":
    case "event":
      if (!(await isAdminByGroup(prisma, userId))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cette destination est réservée aux administrateurs.",
        });
      }
      return;
  }
}
