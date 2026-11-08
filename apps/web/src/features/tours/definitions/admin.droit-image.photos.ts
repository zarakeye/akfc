import type { Tour } from "../tour.types";

/**
 * Le droit à l'image des photos en ligne (admin) — le rapport, ses trois listes, la fenêtre des tags.
 * Fiche de doc associée : même identifiant, « admin.droit-image.photos ».
 * Le tuto ne modifie rien : il montre où lire ce qui demande une action.
 */
export const adminDroitImagePhotos: Tour = {
  id: "admin.droit-image.photos",
  title: "Le droit à l'image des photos",
  description: "Savoir quelles photos en ligne sont masquées, en attente ou à taguer, et les régler.",
  audience: "admin",
  routes: ["/dashboard/droit-image"],
  startRoute: "/dashboard/droit-image",
  doc: "/docs/admin/droit-a-l-image-des-photos",
  steps: [
    {
      target: "droit-image.tabs",
      title: "Trois listes",
      body: "Les photos montrées sur le site public (galeries publiques, carrousel, pages, images des cartes) qui demandent une action. « Masqués » : une personne taguée a refusé, la photo est déjà cachée en ligne. « En attente » : une personne taguée n'a pas répondu. « À taguer » : personne n'est indiqué, le droit à l'image n'agit pas encore.",
      advance: { kind: "next" },
    },
    {
      target: "droit-image.help",
      title: "Quoi faire",
      body: "Chaque liste dit ce qu'on attend de vous : retirer la photo du contenu, relancer la personne, ou indiquer qui est sur la photo.",
      advance: { kind: "next" },
    },
    {
      target: "droit-image.list",
      title: "Régler une photo",
      body: "Chaque ligne dit où la photo est montrée, avec un lien vers la fiche. Un clic sur la vignette ouvre la fenêtre des tags : cocher les personnes, « aucune personne reconnaissable », relancer. La liste se met à jour à la fermeture.",
      advance: { kind: "next" },
    },
  ],
};
