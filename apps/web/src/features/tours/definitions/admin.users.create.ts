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
      title: "Ses groupes",
      body: "Au moins un. Ils décident de ce qu'il voit : documents de groupe, espaces collaboratifs. Le groupe marqué « Admin » donne les droits d'administration.",
      advance: { kind: "next" },
    },
    {
      target: "users.form.legal",
      title: "Majeur ou mineur",
      body: "Obligatoire. Pour un mineur, la date de naissance et un parent référent sont demandés : c'est lui qui signe le droit à l'image.",
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
