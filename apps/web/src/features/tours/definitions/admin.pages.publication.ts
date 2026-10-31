import type { Tour } from "../tour.types";

/**
 * Publier une page éditoriale (admin) — ce que font « Éditer » et « Publier ».
 * Fiche de doc associée : même identifiant, « admin.pages.publication ».
 * Publier rend une page visible de tous : le tuto montre le bouton, il ne le clique pas.
 */
export const adminPagesPublication: Tour = {
  id: "admin.pages.publication",
  title: "Publier une page éditoriale",
  description: "Comprendre l'état d'une page, son constructeur, et sa publication.",
  audience: "admin",
  routes: ["/dashboard/pages"],
  startRoute: "/dashboard/pages",
  steps: [
    {
      target: "pages.list",
      title: "Les pages éditoriales",
      body: "Les pages au contenu propre (l'association, les contacts, l'inscription…). Chacune affiche son état : « Publiée » ou « Brouillon ». Un brouillon n'est visible que des administrateurs.",
      advance: { kind: "next" },
    },
    {
      target: "pages.item.edit",
      title: "Éditer",
      body: "Ouvre le constructeur de la page : son texte, ses images, ses documents. Modifier une page publiée change aussitôt ce que voit le public.",
      advance: { kind: "next" },
    },
    {
      target: "pages.item.publish",
      title: "Publier, ou repasser en brouillon",
      body: "« Publier » rend la page visible de tous, immédiatement ; « Repasser en brouillon » la retire. Ce tuto ne clique pas : à vous de décider quand une page est prête.",
      advance: { kind: "next" },
    },
  ],
};
