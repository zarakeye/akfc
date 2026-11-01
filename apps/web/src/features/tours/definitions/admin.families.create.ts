import type { Tour } from "../tour.types";

/**
 * Créer une famille de disciplines (admin) — le formulaire, sans le valider.
 * Fiche de doc associée : même identifiant, « admin.families.create ».
 */
export const adminFamiliesCreate: Tour = {
  id: "admin.families.create",
  title: "Créer une famille",
  description: "Regrouper des disciplines sous un même titre dans le menu « Nos disciplines ».",
  audience: "admin",
  routes: ["/dashboard/discipline-families", "/dashboard/discipline-families/create"],
  startRoute: "/dashboard/discipline-families",
  doc: "/docs/admin/creer-une-famille",
  steps: [
    {
      target: "families.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer une famille ».",
      advance: { kind: "click" },
    },
    {
      target: "families.form.name",
      title: "Le nom",
      body: "Le titre du regroupement dans le menu, par exemple « Kung-fu ». Le slug se remplit d'après lui.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "families.form.sortOrder",
      title: "L'ordre",
      body: "La place de la famille dans le menu : les plus petits nombres en premier.",
      advance: { kind: "next" },
    },
    {
      target: "families.form.submit",
      title: "Créer",
      body: "La famille est créée ; on y range ensuite des disciplines depuis leur formulaire. Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
  ],
};
