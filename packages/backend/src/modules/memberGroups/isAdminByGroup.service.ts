import type { PrismaClient } from "@prisma/client";

/**
 * Source de vérité unique « admin » : l'utilisateur est-il membre du groupe
 * Administrateurs (isAdminGroup) ? Remplace l'ancien check `role.name === "ADMIN"`
 * dans tout le backend sans accès à la session (services, helpers).
 */
export async function isAdminByGroup(
  prisma: PrismaClient,
  userId: string,
): Promise<boolean> {
  const membership = await prisma.memberGroupMembership.findFirst({
    where: { userId, group: { isAdminGroup: true } },
    select: { id: true },
  });
  return membership !== null;
}
