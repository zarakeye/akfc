import type { Tour } from "../tour.types";

/**
 * Créer un utilisateur (admin) — le formulaire, sans le valider.
 * Fiche de doc associée : même identifiant, « admin.users.create ».
 * « Créer » envoie aussitôt un e-mail au membre : le tuto montre le bouton, il ne le clique pas.
 */
export const adminUsersCreate: Tour = {
  id: "admin.users.create",
  title: "Créer un utilisateur",
  description: "Remplir la fiche d'un nouveau membre : adresse, groupes, majorité.",
  audience: "admin",
  routes: ["/dashboard/users", "/dashboard/users/create"],
  startRoute: "/dashboard/users",
  doc: "/docs/admin/creer-un-utilisateur",
  steps: [
    {
      target: "users.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer un utilisateur ».",
      advance: { kind: "click" },
    },
    {
      target: "users.form.email",
      title: "Son adresse e-mail",
      body: "Elle sert à se connecter, et reçoit le mot de passe. Une adresse déjà utilisée par un membre est refusée.",
      advance: { kind: "input", validate: (v) => v.includes("@") },
    },
    {
      target: "users.form.groups",
      title: "Son statut, puis ses groupes",
      body: "Administrateur, Instructeur ou Bureau le rendent majeur d'office ; rien de coché, c'est un simple membre. Les autres groupes décident de ce qu'il voit : documents de groupe, espaces collaboratifs.",
      advance: { kind: "next" },
    },
    {
      target: "users.form.legal",
      title: "Majeur ou mineur",
      body: "Pour un simple membre : sa date de naissance, si vous l'avez, décide ; sinon, cochez Majeur ou Mineur. Un mineur demande son parent référent, qui validera son droit à l'image.",
      advance: { kind: "next" },
    },
    {
      target: "users.form.submit",
      title: "Créer",
      body: "Ce bouton crée le compte et envoie aussitôt au membre un e-mail de bienvenue avec son mot de passe. Ce tuto ne le clique pas : cliquez vous-même quand la fiche est juste.",
      advance: { kind: "next" },
    },
  ],
};
