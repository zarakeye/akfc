import type { Tour } from "../tour.types";

/**
 * Le droit à l'image d'un mineur (admin) — ce que le club renseigne, où suivre la demande au parent.
 * Fiche de doc associée : même identifiant, « admin.users.droit-image-mineur ».
 * Le tuto ne modifie rien : il montre où se trouvent les informations et les boutons.
 */
export const adminUsersDroitImageMineur: Tour = {
  id: "admin.users.droit-image-mineur",
  title: "Le droit à l'image d'un mineur",
  description: "Renseigner son parent référent, suivre le lien envoyé, le renvoyer.",
  audience: "admin",
  routes: ["/dashboard/users", /^\/dashboard\/users\/(?!create$)[^/]+$/],
  startRoute: "/dashboard/users",
  doc: "/docs/admin/droit-image-d-un-mineur",
  steps: [
    {
      target: "users.list",
      title: "Ouvrez la fiche d'un mineur",
      body: "Cliquez sur la ligne d'un membre mineur pour ouvrir sa fiche.",
      advance: { kind: "route", match: /^\/dashboard\/users\/(?!create$)[^/]+$/ },
    },
    {
      target: "users.legal",
      title: "Son parent référent",
      body: "Mineur, date de naissance vérifiée, puis le nom, la qualité (mère, père, tuteur…) et l'adresse e-mail du parent, d'après le dossier d'inscription de la MJC. Le mineur ne peut pas les changer : le lien part toujours à l'adresse saisie ici. Sans ces informations, ni lien ni formulaire pré-rempli.",
      advance: { kind: "next" },
    },
    {
      target: "users.image-consent.forms",
      title: "Le lien et l'autorisation",
      body: "Quand le membre a envoyé ses souhaits depuis son profil, un encadré « Demande au parent référent » apparaît juste au-dessus : le lien envoyé, sa validité (7 jours) et « Renvoyer le lien au parent ». Une fois que le parent a validé, l'autorisation s'ajoute ici, avec ce qu'il a changé par rapport aux souhaits.",
      advance: { kind: "next" },
    },
  ],
};
