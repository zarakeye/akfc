import type { Tour } from "../tour.types";

/**
 * Mon profil (membre) — ce que contient la page, puis le formulaire d'édition.
 * Fiche de doc associée : même identifiant, « membre.profil ».
 * Le tuto ouvre le formulaire mais n'enregistre rien.
 */
export const membreProfil: Tour = {
  id: "membre.profil",
  title: "Mon profil",
  description: "Retrouver vos informations, vos données, votre droit à l'image, et modifier votre profil.",
  audience: "member",
  routes: ["/profil", "/profil/edit"],
  startRoute: "/profil",
  doc: "/docs/guide/mon-profil",
  steps: [
    {
      target: "profil.export",
      title: "Vos données",
      body: "« Télécharger mes données » vous donne, à tout moment, tout ce que le site conserve à votre sujet.",
      advance: { kind: "next" },
    },
    {
      target: "profil.image-consent",
      title: "Votre droit à l'image",
      body: "Le choix enregistré pour vos photos. Majeur, vous pouvez le donner en ligne ; mineur, vous indiquez vos souhaits et votre parent référent valide, par un lien reçu par e-mail.",
      advance: { kind: "next" },
    },
    {
      target: "profil.edit",
      title: "Modifiez votre profil",
      body: "Cliquez sur « Éditer » pour ouvrir le formulaire.",
      advance: { kind: "click" },
    },
    {
      target: "profil.form.avatar",
      title: "Votre photo",
      body: "Facultative : choisissez un fichier ou prenez-la avec l'appareil photo, puis validez. Elle est enregistrée dès que vous la validez, sans attendre le bouton du bas.",
      advance: { kind: "next" },
    },
    {
      target: "profil.form.submit",
      title: "Enregistrer",
      body: "Les autres champs (nom, pseudo, téléphone, à propos…) ne sont enregistrés qu'avec ce bouton. Ce tuto ne le clique pas.",
      advance: { kind: "next" },
    },
    {
      target: "profil.password",
      title: "Votre mot de passe",
      body: "Plus bas, la section Sécurité permet de changer votre mot de passe : il faut le mot de passe actuel pour en choisir un nouveau.",
      advance: { kind: "next" },
    },
  ],
};
