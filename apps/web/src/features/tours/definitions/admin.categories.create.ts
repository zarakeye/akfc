import type { Tour } from "../tour.types";

/**
 * Créer une catégorie (admin) — le formulaire, sans le valider.
 * Fiche de doc associée : même identifiant, « admin.categories.create ».
 */
export const adminCategoriesCreate: Tour = {
  id: "admin.categories.create",
  title: "Créer une catégorie",
  description: "Ajouter un type d'activité (cours, stage…) auquel se rattachent les disciplines.",
  audience: "admin",
  routes: ["/dashboard/categories", "/dashboard/categories/create"],
  startRoute: "/dashboard/categories",
  doc: "/docs/admin/creer-une-categorie",
  steps: [
    {
      target: "categories.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer une catégorie ».",
      advance: { kind: "click" },
    },
    {
      target: "categories.form.type",
      title: "Le type",
      body: "Son nom, unique : « Cours », « Stage »… Chaque discipline appartient à une catégorie, qui ne se change plus ensuite.",
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
