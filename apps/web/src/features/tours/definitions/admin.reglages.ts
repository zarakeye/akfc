import type { Tour } from "../tour.types";

/**
 * Les réglages du site (admin) — partie par partie, sans rien enregistrer.
 * Fiche de doc associée : même identifiant, « admin.reglages ».
 */
export const adminReglages: Tour = {
  id: "admin.reglages",
  title: "Les réglages du site",
  description: "Les titres, le logo, les coordonnées publiques, les informations légales, les partenaires.",
  audience: "admin",
  routes: ["/dashboard/settings"],
  startRoute: "/dashboard/settings",
  doc: "/docs/admin/les-reglages",
  steps: [
    {
      target: "settings.titles",
      title: "Les titres",
      body: "Le titre court s'affiche dans l'en-tête, l'onglet du navigateur et les e-mails ; le titre long et l'accroche, en dessous.",
      advance: { kind: "next" },
    },
    {
      target: "settings.logo",
      title: "Le logo",
      body: "Un fichier SVG de 512 Ko au plus. Il est enregistré dès qu'on le choisit, sans attendre le bouton du bas. L'aperçu choisit un fond clair ou sombre selon la couleur du logo.",
      advance: { kind: "next" },
    },
    {
      target: "settings.save",
      title: "Enregistrer",
      body: "Ce bouton enregistre les titres, l'accroche et l'e-mail cité dans l'e-mail de bienvenue. Chaque partie plus bas a son propre bouton. Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
    {
      target: "settings.contact",
      title: "Les coordonnées publiques",
      body: "L'e-mail, les téléphones et l'adresse affichés à tous sur la page « Nous contacter ».",
      advance: { kind: "next" },
    },
    {
      target: "settings.legal",
      title: "Les informations légales",
      body: "Les pages « Mentions légales » et « Politique de confidentialité » sont générées à partir de ces seuls champs.",
      advance: { kind: "next" },
    },
    {
      target: "settings.partners",
      title: "Les partenaires",
      body: "Les structures liées au club (la MJC, la fédération…) : leurs logos s'affichent dans le pied de page et sur la page « S'inscrire ».",
      advance: { kind: "next" },
    },
  ],
};
