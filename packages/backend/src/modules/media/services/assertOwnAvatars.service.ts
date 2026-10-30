import { TRPCError } from "@trpc/server";

import { avatarUserIdsFromContent, type PageContentV1 } from "@contracts/page";

/**
 * Un avatar représente son titulaire ; personne ne le pose dans un contenu à sa place.
 *
 * Un avatar s'affiche à côté du nom de son titulaire (un commentaire, l'auteur d'une actualité, une
 * réaction) : c'est sa raison d'être. Le POSER dans un contenu (bloc média-texte ou texte enrobant,
 * référence `{ kind: "avatar", userId }`) est une autre chose : c'est publier le visage de quelqu'un
 * sur une page qu'il n'a pas écrite. Un membre ne pose donc que SON avatar, administrateurs compris,
 * quelle que soit la circonstance.
 *
 * Appelée au début de chaque procédure qui enregistre un contenu du constructeur de pages, sur les
 * contenus REÇUS (pas sur ceux relus en base) : un contenu plus ancien qui montrerait l'avatar d'un
 * autre est refusé au prochain enregistrement de ce bloc, avec ce message.
 */
export function assertOwnAvatars(
  userId: string,
  ...contents: readonly (PageContentV1 | null | undefined)[]
): void {
  const foreign = contents.some(
    (content) => content != null && avatarUserIdsFromContent(content).some((id) => id !== userId),
  );
  if (foreign) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Un contenu ne peut montrer que votre propre avatar. Remplacez l'avatar d'un autre membre par une photo de la bibliothèque.",
    });
  }
}
