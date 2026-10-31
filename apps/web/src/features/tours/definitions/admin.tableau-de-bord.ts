import type { Tour } from "../tour.types";

/**
 * Le tableau de bord (admin) — où se trouve chaque outil d'administration.
 * Fiche de doc associée : même identifiant, « admin.tableau-de-bord ».
 * Rien n'est cliqué : des explications.
 */
export const adminTableauDeBord: Tour = {
  id: "admin.tableau-de-bord",
  title: "Le tableau de bord",
  description: "Repérer le panneau de contrôle et les raccourcis vers les contenus.",
  audience: "admin",
  routes: ["/dashboard"],
  startRoute: "/dashboard",
  doc: "/docs/admin/tableau-de-bord",
  steps: [
    {
      title: "Le tableau de bord",
      body: "C'est d'ici que l'on administre le site : les membres, les activités, les pages, les médias et les réglages.",
      advance: { kind: "next" },
    },
    {
      target: "dashboard.sidebar",
      title: "Le panneau de contrôle",
      body: "Toutes les pages d'administration, rangées par section. Le « + » à droite d'un élément ouvre directement sa création. Sur un petit écran, ce bouton ouvre le panneau.",
      advance: { kind: "next" },
    },
    {
      target: "dashboard.contents",
      title: "Les raccourcis",
      body: "Les contenus du site les plus souvent modifiés : disciplines, familles, cours, origines, posts.",
      advance: { kind: "next" },
    },
    {
      title: "Et ensuite ?",
      body: "Chaque page a sa fiche dans la documentation des administrateurs (« Doc admin », en bas du panneau), et le bouton « ? » propose les tutos de la page où vous êtes.",
      advance: { kind: "next" },
    },
  ],
};
