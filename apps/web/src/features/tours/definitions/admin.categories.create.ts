import type { Tour } from "../tour.types";

/**
 * Créer une catégorie (admin) — le formulaire, sans le valider.
 * Fiche de doc associée : même identifiant, « admin.categories.create ».
 */
export const adminCategoriesCreate: Tour = {
  id: "admin.categories.create",
  title: "Créer une catégorie",
  description: "Ajouter une catégorie manquante de la liste (Cours, Stage, Évènement), à laquelle se rattachent les disciplines.",
  audience: "admin",
  routes: ["/dashboard/categories", "/dashboard/categories/create"],
  startRoute: "/dashboard/categories",
  doc: "/docs/admin/creer-une-categorie",
  steps: [
    {
      target: "categories.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer une catégorie ». Le bouton n'apparaît que s'il manque une catégorie de la liste.",
      advance: { kind: "click" },
    },
    {
      target: "categories.form.key",
      title: "La catégorie",
      body: "Choisissez-la dans la liste : seules celles qui manquent sont proposées. C'est elle que lit le site (les créneaux des cours, le choix d'un stage ou d'un évènement dans une galerie) ; elle ne change plus ensuite.",
      advance: { kind: "input", validate: (v) => v.length > 0 },
    },
    {
      target: "categories.form.type",
      title: "Le libellé",
      body: "Le nom affiché, proposé d'après la catégorie (« Stage »…). Vous pourrez le changer plus tard sans rien casser. Chaque discipline appartient à une catégorie, qui ne se change plus ensuite.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "categories.form.submit",
      title: "Créer",
      body: "La catégorie est créée, avec son dossier dans la bibliothèque. Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
  ],
};
