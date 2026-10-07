import type { PrismaClient } from "@prisma/client";

import { addIncomingMessage } from "./tickets.service";
import { parseTicketRef } from "./ticketRef";

/*
 * Rattachement d'un e-mail reçu (boîte noreply@) à sa demande. Indépendant d'IMAP : la relève
 * (imapIntake.service) lui passe des e-mails déjà décodés, ce qui permet de le tester seul.
 *
 * Règles :
 *   - demande retrouvée par les en-têtes de réponse (In-Reply-To / References = Message-ID d'une
 *     réponse du club), sinon par la référence [AKFC-0042] de l'objet ;
 *   - l'expéditeur doit être l'adresse du demandeur (sinon n'importe qui pourrait écrire dans une
 *     demande en recopiant sa référence) ;
 *   - réponses automatiques (absence, rebond, liste) : jamais ajoutées, jamais de réouverture ;
 *   - seul le nouveau texte est gardé : le message cité en dessous est retiré.
 */

export type InboundEmail = {
  messageId: string | null;
  /** In-Reply-To puis References, dans l'ordre. */
  references: string[];
  subject: string;
  fromEmail: string;
  fromName: string | null;
  text: string;
  attachmentNames: string[];
  autoReply: boolean;
};

export type InboundOutcome =
  | { kind: "added"; ticketId: string; number: number; reopened: boolean; body: string }
  | { kind: "duplicate"; ticketId: string | null }
  | { kind: "not-ticket" }
  | { kind: "review"; reason: "unknown-ticket" | "sender-mismatch" | "auto-reply" | "empty"; number: number | null };

const QUOTE_HEADER = [
  /^\s*(le|on)\b.{0,200}\b(a écrit|wrote)\s*:\s*$/i,
  /^\s*-{2,}\s*(original message|message d'origine|message original)\s*-{2,}\s*$/i,
  /^\s*_{10,}\s*$/,
  /^\s*(de|from)\s*:\s*.+$/i,
];

/** Retire la partie citée d'une réponse (« Le … a écrit : », lignes « > », message d'origine). */
export function extractReplyText(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // « Le lun. 6 oct. 2026 à 10:00, X <x@y> a écrit : » peut être coupé sur deux lignes.
    const joined = i + 1 < lines.length ? `${l} ${lines[i + 1]}` : l;
    if (QUOTE_HEADER.some((re) => re.test(l))) { end = i; break; }
    if (/^\s*(le|on)\b/i.test(l) && /\b(a écrit|wrote)\s*:\s*$/i.test(joined) && !/\b(a écrit|wrote)\s*:\s*$/i.test(l)) { end = i; break; }
    if (/^\s*>/.test(l)) {
      // Un bloc cité ; on s'arrête s'il ne reste ensuite que du cité ou du blanc.
      const rest = lines.slice(i);
      if (rest.every((r) => /^\s*>/.test(r) || r.trim() === "")) { end = i; break; }
    }
  }
  const kept = lines.slice(0, end).filter((l) => !/^\s*>/.test(l)).join("\n").trim();
  return kept || text.trim();
}

function normId(id: string): string {
  return id.trim().replace(/^<|>$/g, "");
}

export async function processInboundEmail(db: PrismaClient, mail: InboundEmail): Promise<InboundOutcome> {
  if (mail.messageId) {
    const dup = await db.ticketMessage.findUnique({ where: { emailMessageId: mail.messageId }, select: { ticketId: true } });
    if (dup) return { kind: "duplicate", ticketId: dup.ticketId };
  }

  // 1) en-têtes de réponse : Message-ID d'un message connu (nos réponses en ont un).
  let ticket: { id: string; number: number; requesterEmail: string; requesterId: string | null } | null = null;
  const refs = [...new Set(mail.references.map(normId).filter(Boolean))];
  if (refs.length > 0) {
    const hit = await db.ticketMessage.findFirst({
      where: { OR: refs.flatMap((r) => [{ emailMessageId: r }, { emailMessageId: `<${r}>` }]) },
      select: { ticket: { select: { id: true, number: true, requesterEmail: true, requesterId: true } } },
    });
    ticket = hit?.ticket ?? null;
  }
  // 2) référence dans l'objet.
  const number = ticket?.number ?? parseTicketRef(mail.subject);
  if (number === null) return { kind: "not-ticket" };
  if (mail.autoReply) return { kind: "review", reason: "auto-reply", number };
  if (!ticket) {
    ticket = await db.ticket.findUnique({
      where: { number },
      select: { id: true, number: true, requesterEmail: true, requesterId: true },
    });
  }
  if (!ticket) return { kind: "review", reason: "unknown-ticket", number };
  if (mail.fromEmail.trim().toLowerCase() !== ticket.requesterEmail.toLowerCase()) {
    return { kind: "review", reason: "sender-mismatch", number };
  }

  let body = extractReplyText(mail.text);
  if (mail.attachmentNames.length > 0) {
    body += `\n\n[Pièce(s) jointe(s) non reprise(s) : ${mail.attachmentNames.join(", ")} — voir la boîte noreply@, dossier des demandes traitées.]`;
  }
  if (!body.trim()) return { kind: "review", reason: "empty", number };

  const res = await addIncomingMessage(db, {
    ticketId: ticket.id,
    body: body.slice(0, 20_000),
    fromEmail: mail.fromEmail,
    authorId: ticket.requesterId,
    authorName: mail.fromName,
    emailMessageId: mail.messageId,
  });
  if (res.duplicate) return { kind: "duplicate", ticketId: ticket.id };
  return { kind: "added", ticketId: ticket.id, number: ticket.number, reopened: res.reopened, body };
}
