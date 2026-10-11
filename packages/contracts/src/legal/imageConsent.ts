/** Droit à l'image d'un membre : libellés partagés (table des utilisateurs, fiche, export). */
export const IMAGE_CONSENT_VALUES = ["UNKNOWN", "GRANTED", "REFUSED"] as const;
export type ImageConsentValue = (typeof IMAGE_CONSENT_VALUES)[number];

export const IMAGE_CONSENT_LABEL: Record<ImageConsentValue, string> = {
  UNKNOWN: "Non recueillie",
  GRANTED: "Accordée",
  REFUSED: "Refusée",
};
