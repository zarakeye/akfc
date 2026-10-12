import { IMAGE_USAGE_LABEL, type ImageUsageValue } from "@contracts/legal/imageConsent";

export function formatDate(d: Date | string | null | undefined): string {
  return d ? new Date(d).toLocaleDateString("fr-FR") : "—";
}

/** « Espace membres, Site public » ou « aucun usage ». */
export function formatUsages(usages: readonly ImageUsageValue[]): string {
  return usages.length ? usages.map((u) => IMAGE_USAGE_LABEL[u]).join(", ") : "aucun usage";
}

export function formatKeepAfterLeave(v: boolean | null): string | null {
  if (v === null) return null;
  return v ? "usage des images déjà prises autorisé après le départ" : "images retirées au plus tard un an après le départ";
}
