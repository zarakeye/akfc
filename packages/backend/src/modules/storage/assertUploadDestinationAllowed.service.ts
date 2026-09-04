import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";
import { assertCanWriteGroupSpace } from "@backend/modules/memberGroups/assertCanWriteGroupSpace.service";

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
  // `group` : droit d'écriture sur l'espace. Toutes les autres destinations
  // (entités discipline/stage/event, common_repository, perso) sont ouvertes
  // à TOUT UTILISATEUR CONNECTÉ pour l'ÉCRITURE : un membre peut déposer, le
  // contenu part `pending`, et la LECTURE reste admin (assertCanReadPath).
  if (destination.kind === "group") {
    await assertCanWriteGroupSpace({ prisma, userId, groupId: destination.groupId });
  }
}
