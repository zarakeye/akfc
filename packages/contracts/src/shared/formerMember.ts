/**
 * Ce qu'affiche le site à la place d'un auteur dont le compte a été supprimé.
 *
 * Un commentaire, un post ou un média survit à son auteur : la base vide le lien
 * (`authorId`, `uploaderUserId` à `null`), et l'affichage montre ce libellé, sans nom, sans
 * initiales ni portrait qui laisseraient deviner la personne.
 */
export const FORMER_MEMBER_LABEL = "Ancien membre";
