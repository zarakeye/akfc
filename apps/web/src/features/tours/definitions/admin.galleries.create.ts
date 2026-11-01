import type { Tour } from "../tour.types";

/**
 * Créer une galerie (admin) — le formulaire, sans le valider.
 * Fiche de doc associée : même identifiant, « admin.galleries.create ».
 */
export const adminGalleriesCreate: Tour = {
  id: "admin.galleries.create",
  title: "Créer une galerie",
  description: "Réunir des photos, les rattacher à une discipline ou un stage, choisir qui les voit.",
  audience: "admin",
  routes: ["/dashboard/galleries", "/dashboard/galleries/create"],
  startRoute: "/dashboard/galleries",
  doc: "/docs/admin/creer-une-galerie",
  steps: [
    {
      target: "galleries.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer une galerie ».",
      advance: { kind: "click" },
    },
    {
      target: "galleries.form.title",
      title: "Un titre",
      body: "Le nom de la galerie ; le slug (son adresse) se remplit d'après lui.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "galleries.form.visibility",
      title: "Qui la voit",
      body: "« Public » : tout le monde ; « Membres » : les seuls membres connectés.",
      advance: { kind: "next" },
    },
    {
      target: "galleries.form.facets",
      title: "Le rattachement",
      body: "Discipline, catégorie, stage, évènement, origine : facultatifs et cumulables. Sur la page Galeries, elles sont regroupées par discipline puis par catégorie, et filtrables par origine.",
      advance: { kind: "next" },
    },
    {
      target: "galleries.form.images",
      title: "Les images",
      body: "« Ajouter des médias » ouvre la bibliothèque pour y choisir les photos.",
      advance: { kind: "next" },
    },
    {
      target: "galleries.form.submit",
      title: "Créer",
      body: "La galerie est créée avec ses images, visible selon son réglage dès sa création. Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
  ],
};
