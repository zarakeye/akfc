import type { Tour } from "../tour.types";

/**
 * Créer un groupe de membres (admin) — le formulaire, sans le valider.
 * Fiche de doc associée : même identifiant, « admin.groups.create ».
 */
export const adminGroupsCreate: Tour = {
  id: "admin.groups.create",
  title: "Créer un groupe",
  description: "Créer un groupe de membres, et son espace collaboratif s'il en faut un.",
  audience: "admin",
  routes: ["/dashboard/groups", "/dashboard/groups/create"],
  startRoute: "/dashboard/groups",
  doc: "/docs/admin/creer-un-groupe",
  steps: [
    {
      target: "groups.list.create",
      title: "Ouvrez le formulaire",
      body: "Les groupes décident de ce que voient les membres. Cliquez sur « Créer un groupe ».",
      advance: { kind: "click" },
    },
    {
      target: "groups.form.name",
      title: "Le nom",
      body: "Par exemple « Bureau » ou « Compétition ».",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "groups.form.parent",
      title: "Le groupe parent",
      body: "Les membres d'un groupe parent ont accès, au même niveau, à l'espace de ses sous-groupes. Sans choix, le groupe est rattaché à « Administrateurs ».",
      advance: { kind: "next" },
    },
    {
      target: "groups.form.collaborative",
      title: "Un espace collaboratif ?",
      body: "Coché, le groupe reçoit un dossier partagé, où chaque membre est éditeur ou lecteur.",
      advance: { kind: "next" },
    },
    {
      target: "groups.form.submit",
      title: "Créer",
      body: "Le groupe est créé, avec son dossier s'il est collaboratif ; on y ajoute ensuite les membres depuis sa page. Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
  ],
};
