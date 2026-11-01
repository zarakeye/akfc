import type { Tour } from "../tour.types";

/**
 * Créer une origine culturelle (admin) — le formulaire, sans le valider.
 * Fiche de doc associée : même identifiant, « admin.origins.create ».
 */
export const adminOriginsCreate: Tour = {
  id: "admin.origins.create",
  title: "Créer une origine",
  description: "Décrire une origine culturelle, partagée par des disciplines, des stages et des évènements.",
  audience: "admin",
  routes: ["/dashboard/origins", "/dashboard/origins/create"],
  startRoute: "/dashboard/origins",
  doc: "/docs/admin/creer-une-origine",
  steps: [
    {
      target: "origins.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer une origine ».",
      advance: { kind: "click" },
    },
    {
      target: "origins.form.name",
      title: "Le nom",
      body: "Unique : « Chine », « Fujian »… Le slug se remplit d'après lui.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "origins.form.metadata",
      title: "Ses métadonnées",
      body: "Pays, région, drapeau, période historique : facultatifs, ils servent à l'affichage (le drapeau apparaît à côté de l'origine).",
      advance: { kind: "next" },
    },
    {
      target: "origins.form.submit",
      title: "Créer",
      body: "L'origine est créée et se choisit ensuite dans les formulaires. Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
  ],
};
