/**
 * Référence affichée d'une demande : « AKFC-0042 ». Le numéro (Ticket.number) est séquentiel
 * et ne change jamais ; la référence figure dans l'objet de chaque e-mail (« [AKFC-0042] … »),
 * ce qui permet de rattacher une réponse reçue par e-mail à sa demande.
 */
export const TICKET_REF_PREFIX = "AKFC";

/** 42 → « AKFC-0042 » (4 chiffres au minimum, sans limite au-delà). */
export function formatTicketRef(number: number): string {
  return `${TICKET_REF_PREFIX}-${String(number).padStart(4, "0")}`;
}

/** Objet d'e-mail préfixé par la référence : « [AKFC-0042] Mon objet ». */
export function ticketSubject(number: number, subject: string): string {
  return `[${formatTicketRef(number)}] ${subject}`;
}

/**
 * Numéro de demande trouvé dans un objet d'e-mail (« Re: [AKFC-0042] … » → 42), ou null.
 * Seule la forme entre crochets compte : une référence citée dans le texte libre d'un objet
 * ne doit pas rattacher le message à une autre demande.
 */
export function parseTicketRef(subject: string | null | undefined): number | null {
  const m = /\[\s*AKFC-(\d{1,9})\s*\]/i.exec(subject ?? "");
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
