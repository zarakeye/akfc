import type { Tour } from "../tour.types";

/**
 * Ajouter des séances à un stage (admin) — de la liste à l'édition.
 * Fiche de doc associée : même identifiant, « admin.seminars.seances ».
 * Le tuto montre la gestion des séances sans en créer.
 */
export const adminSeminarsSeances: Tour = {
  id: "admin.seminars.seances",
  title: "Ajouter des séances",
  description: "Donner ses dates à un stage, pour qu'il apparaisse dans l'agenda.",
  audience: "admin",
  routes: ["/dashboard/seminars", /^\/dashboard\/seminars\/\d+(\/edit)?$/],
  startRoute: "/dashboard/seminars",
  doc: "/docs/admin/ajouter-des-seances",
  steps: [
    {
      target: "seminars.list",
      title: "Choisissez un stage",
      body: "Cliquez sur la ligne d'un stage pour ouvrir sa fiche. S'il n'y en a aucun, créez-en d'abord un (tuto « Créer un stage »).",
      advance: { kind: "route", match: /^\/dashboard\/seminars\/\d+$/ },
    },
    {
      target: "fiche.edit",
      title: "Éditez-le",
      body: "Les séances se gèrent depuis l'édition du stage. Cliquez sur « Éditer ».",
      advance: { kind: "route", match: /^\/dashboard\/seminars\/\d+\/edit$/ },
    },
    {
      target: "seminars.sessions",
      title: "Les séances",
      body: "« Ajouter une séance » : une date, une heure de début et de fin, un lieu et des notes si besoin. Chaque séance s'enregistre dès sa validation, sans le bouton du formulaire. Un stage n'apparaît dans l'agenda qu'avec une séance à venir.",
      advance: { kind: "next" },
    },
  ],
};
