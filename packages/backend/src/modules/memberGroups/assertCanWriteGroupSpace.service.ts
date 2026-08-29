import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";

/**
 * Garde d'ÉCRITURE dans l'espace d'un groupe collaboratif : autorise un ADMIN
 * (au-dessus des groupes) OU un membre EDITOR du groupe. Un VIEWER ou un
 * non-membre est refusé (FORBIDDEN).
 *
 * À appeler dans CHAQUE procédure d'upload dès que la destination vise un
 * groupe (`destination.kind === "group"`), quel que soit le fournisseur
 * (Cloudinary / R2) : c'est le point de passage commun, donc pas d'angle mort.
 */
export async function assertCanWriteGroupSpace(params: {
  prisma: PrismaClient;
  userId: string;
  groupId: string;
}): Promise<void> {
  const { prisma, userId, groupId } = params;

  if (await isAdminByGroup(prisma, userId)) return;

  const access = await resolveGroupAccessForUser(prisma, userId, groupId);
  if (access !== "EDITOR") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Dépôt réservé aux éditeurs de ce groupe.",
    });
  }
}
