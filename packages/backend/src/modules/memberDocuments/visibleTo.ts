import type { Prisma, PrismaClient } from "@prisma/client";

import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";

/**
 * Condition Prisma « ce document des membres concerne cet utilisateur ».
 *
 * Partagée par le routeur (liste, compteurs, marquage lu / non lu) et par la route de
 * livraison du fichier (`/api/media/member-document/[id]`) : une seule règle, pour que ce
 * qu'un membre voit dans la liste et ce qu'il peut ouvrir ne divergent jamais.
 *
 *   - ALL_MEMBERS : tous les membres ;
 *   - SPECIFIC : destinataire désigné OU membre d'un groupe visé. L'appartenance est résolue
 *     à chaque lecture : un membre ajouté à un groupe reçoit les documents déjà adressés au
 *     groupe, un membre qui en sort ne les voit plus.
 */
export function memberDocumentVisibleTo(userId: string) {
  return {
    OR: [
      { audience: "ALL_MEMBERS" as const },
      {
        audience: "SPECIFIC" as const,
        OR: [
          { recipients: { some: { userId } } },
          {
            groups: { some: { group: { memberships: { some: { userId } } } } },
          },
        ],
      },
    ],
  };
}

/**
 * Condition « ce membre peut OUVRIR ce document, et le marquer lu ou non lu ».
 *
 * `memberDocumentVisibleTo`, PLUS les documents déposés dans un espace collaboratif auquel il a
 * accès par HÉRITAGE (membre d'un groupe parent, administrateur). La cloche collaborative compte
 * ces documents (`collaborativeEntriesForMember`) : sans cette condition, elle signalait des
 * documents non lus que le membre ne pouvait ni ouvrir, ni marquer lus — la cloche ne se vidait
 * jamais, pour tout administrateur en particulier.
 *
 * Partagée par la liste, le marquage et la route de livraison du fichier.
 */
export async function memberDocumentReadableBy(
  prisma: PrismaClient,
  userId: string,
): Promise<{ where: Prisma.MemberDocumentWhereInput; collaborativeGroupIds: string[] }> {
  const collaborativeGroupIds = (await collaborativeEntriesForMember(prisma, userId)).map((e) => e.groupId);
  const visible = memberDocumentVisibleTo(userId);
  return {
    where:
      collaborativeGroupIds.length === 0
        ? visible
        : {
            OR: [
              ...visible.OR,
              { audience: "SPECIFIC" as const, groups: { some: { groupId: { in: collaborativeGroupIds } } } },
            ],
          },
    collaborativeGroupIds,
  };
}
