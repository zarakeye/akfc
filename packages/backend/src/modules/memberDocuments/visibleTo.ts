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
