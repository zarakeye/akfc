import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import type { UploadDestination } from "@contracts/storage/upload-destination.schema";
import { assertCanWriteGroupSpace } from "@backend/modules/memberGroups/assertCanWriteGroupSpace.service";

/**
 * Autorise (ou refuse) une destination d'upload selon l'utilisateur.
 *
 *   - group : droit d'ÉCRITURE sur l'espace du groupe (assertCanWriteGroupSpace :
 *             EDITOR, héritage de la hiérarchie compris ; un administrateur passe) ;
 *   - toutes les autres destinations (discipline existante ou proposée, stage,
 *     événement, dépôt commun, perso) : tout utilisateur CONNECTÉ. Le fichier y naît
 *     EN ATTENTE : il n'apparaît nulle part tant qu'un administrateur ne l'a pas
 *     validé, et la LECTURE de ces dossiers reste réservée aux administrateurs
 *     (assertCanReadPath). L'espace perso est toujours celui de l'appelant : son
 *     chemin est dérivé de son identifiant côté serveur.
 *   - event avec `disciplineIds` : rattacher des disciplines à un événement modifie sa
 *     fiche PUBLIQUE, sans validation : réservé aux administrateurs. Vérifié dès la
 *     signature, pour ne pas laisser partir un fichier que l'enregistrement refuserait.
 *
 * Le dossier de dépôt lui-même n'est jamais fourni par le client : le serveur le
 * calcule depuis la destination (resolvePendingUploadFolder).
 */
export async function assertUploadDestinationAllowed(params: {
  prisma: PrismaClient;
  userId: string;
  isAdmin: boolean;
  destination: UploadDestination;
}): Promise<void> {
  const { prisma, userId, isAdmin, destination } = params;
  if (destination.kind === "event" && destination.disciplineIds.length > 0 && !isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seul un administrateur peut rattacher des disciplines à un événement.",
    });
  }
  // `group` : droit d'écriture sur l'espace. Toutes les autres destinations
  // (entités discipline/stage/event, common_repository, perso) sont ouvertes
  // à TOUT UTILISATEUR CONNECTÉ pour l'ÉCRITURE : un membre peut déposer, le
  // contenu part `pending`, et la LECTURE reste admin (assertCanReadPath).
  if (destination.kind === "group") {
    await assertCanWriteGroupSpace({ prisma, userId, groupId: destination.groupId });
  }
}
