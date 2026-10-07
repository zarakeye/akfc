/** Libellés et formats partagés par les écrans des demandes. Fonctions pures, au niveau module. */

export type TicketStatusValue = "WAITING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";

export const STATUS_LABEL: Record<TicketStatusValue, string> = {
  WAITING: "En attente",
  IN_PROGRESS: "En cours",
  ANSWERED: "Répondu",
  CLOSED: "Close",
};

export const STATUS_CLASS: Record<TicketStatusValue, string> = {
  WAITING: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  IN_PROGRESS: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  ANSWERED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  CLOSED: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
};

const DAY = 24 * 3600 * 1000;

export function shortDate(d: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(d));
}

export function dateTime(d: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
}

/** « dans 3 j », « aujourd'hui », « en retard de 2 j ». */
export function dueLabel(dueAt: Date | string, now: number): string {
  const diff = new Date(dueAt).getTime() - now;
  const days = Math.round(Math.abs(diff) / DAY);
  if (diff < 0) return days === 0 ? "en retard" : `en retard de ${days} j`;
  return days === 0 ? "aujourd'hui" : `dans ${days} j`;
}

export const EVENT_LABEL: Record<string, string> = {
  CREATED: "Demande reçue",
  TAKEN: "Prise en charge",
  TRANSFERRED: "Transférée",
  MESSAGE_IN: "Message du demandeur",
  MESSAGE_OUT: "Réponse envoyée",
  CLOSED: "Close",
  REOPENED: "Rouverte",
};
