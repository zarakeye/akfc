/**
 * Coordonnées du club, affichées dans le pied de page.
 *
 * TOUT EST VIDE À DESSEIN. Chaque bloc du footer ne s'affiche que si sa
 * valeur est renseignée, donc remplir se fait au fil de l'eau sans rien
 * casser.
 *
 * Je n'ai pas mis de fausses valeurs « à remplacer » : ce genre de
 * remplissage finit par passer en production. Un footer sans adresse est
 * visiblement incomplet, et quelqu'un le corrige ; un footer avec une
 * adresse plausible mais fausse ne l'est pas, et personne ne le voit.
 */
export interface ClubInfo {
  /** Une phrase de présentation, sous le logo. */
  tagline: string;
  /** Adresse postale, une ligne par élément. */
  address: string[];
  phone: string;
  email: string;
  /** Créneaux d'ouverture ou d'entraînement, une ligne par élément. */
  hours: string[];
  /** Réseaux sociaux. Seuls ceux dont l'URL est renseignée s'affichent. */
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  /** Numéro RNA ou SIRET, mentions administratives. */
  legalMentions: string[];
}

export const CLUB_INFO: ClubInfo = {
  tagline: "",
  address: [],
  phone: "",
  email: "",
  hours: [],
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
  },
  legalMentions: [],
};

/**
 * Pages légales du pied de page.
 *
 * Servies par la route générique `/infos/[slug]`, adossée à `SitePage` : tu
 * les rédiges au centre de contrôle (`/dashboard/site-pages/<slug>`) sans
 * ligne de code. Tant qu'elles ne le sont pas, elles s'affichent en
 * annonçant qu'elles ne sont pas encore rédigées — jamais un 404.
 */
export const FOOTER_LEGAL_LINKS = [
  { href: "/infos/mentions-legales", label: "Mentions légales" },
  { href: "/infos/confidentialite", label: "Politique de confidentialité" },
] as const;
