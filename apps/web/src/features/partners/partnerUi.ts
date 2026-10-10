/** Libellés partagés des partenaires (fonctions pures, au niveau module). */

export type PartnerRoleValue = "HOST" | "FEDERATION" | "OTHER";

export const PARTNER_ROLE_LABEL: Record<PartnerRoleValue, string> = {
  HOST: "Lieu des cours et des inscriptions",
  FEDERATION: "Fédération d'affiliation",
  OTHER: "Partenaire",
};

/** Libellé court pour le choix du rôle dans les Réglages. */
export const PARTNER_ROLE_OPTION: Record<PartnerRoleValue, string> = {
  HOST: "Accueil (cours, inscriptions, paiements)",
  FEDERATION: "Fédération (affiliation, licences)",
  OTHER: "Autre partenaire",
};
