/**
 * Dates de la corbeille : jeté le, effacé le (suppression définitive par la purge de nuit).
 * Le préavis de 7 jours est celui de la cloche des admins (TRASH_NOTICE_DAYS côté serveur).
 */

const NOTICE_MS = 7 * 24 * 3600 * 1000;

/** « 13 nov. 2026 », sans l'heure : la purge passe la nuit, l'heure n'apprend rien. */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Vrai si l'élément sera effacé définitivement dans les 7 jours. */
export function purgeIsSoon(purgeAt: string, now = Date.now()): boolean {
  return new Date(purgeAt).getTime() - now <= NOTICE_MS;
}

/** Infobulle d'un élément : qui l'a jeté, et quand il sera effacé. */
export function trashTooltip(entry: { previousPath: string; purgeAt: string; trashedByName: string | null }): string {
  const by = entry.trashedByName ? `Jeté par ${entry.trashedByName}. ` : "";
  return `${entry.previousPath}\n${by}Effacé définitivement le ${formatDay(entry.purgeAt)}.`;
}
