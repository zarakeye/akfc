/** Droit à l'image d'un membre : libellés partagés (table des utilisateurs, fiche, export). */
export const IMAGE_CONSENT_VALUES = ["UNKNOWN", "GRANTED", "REFUSED"] as const;
export type ImageConsentValue = (typeof IMAGE_CONSENT_VALUES)[number];

export const IMAGE_CONSENT_LABEL: Record<ImageConsentValue, string> = {
  UNKNOWN: "Non recueillie",
  GRANTED: "Accordée",
  REFUSED: "Refusée",
};

/** Usages de l'image proposés sur le formulaire (une ligne Oui / Non chacun), dans l'ordre du PDF. */
export const IMAGE_USAGE_VALUES = ["MEMBER_SPACE", "PUBLIC_SITE", "SOCIAL_NETWORKS", "PRINT", "PRESS"] as const;
export type ImageUsageValue = (typeof IMAGE_USAGE_VALUES)[number];

export const IMAGE_USAGE_LABEL: Record<ImageUsageValue, string> = {
  MEMBER_SPACE: "Espace membres",
  PUBLIC_SITE: "Site public",
  SOCIAL_NETWORKS: "Réseaux sociaux du club",
  PRINT: "Supports imprimés",
  PRESS: "Presse locale",
};

/** Formulaire vierge à imprimer (apps/web/public). */
export const IMAGE_CONSENT_BLANK_FORM_URL = "/documents/autorisation-droit-image.pdf";

/** Formulaire signé : PDF ou photo (le HEIC des téléphones est converti en JPEG dans le navigateur). */
export const IMAGE_CONSENT_FORM_MIME_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const IMAGE_CONSENT_FORM_MAX_BYTES = 15 * 1024 * 1024;

/** Statut déduit d'un formulaire : accordée dès qu'un usage est autorisé. */
export function consentFromUsages(usages: readonly ImageUsageValue[]): Exclude<ImageConsentValue, "UNKNOWN"> {
  return usages.length > 0 ? "GRANTED" : "REFUSED";
}
