import { randomUUID } from "node:crypto";

import type { PrismaClient } from "@prisma/client";

import { processInboundEmail, type InboundOutcome } from "./inboundEmail";
import { notifyClub } from "./imapIntake.service";
import { sendTicketRecaps } from "./recap.service";
import { getTicketDetail, ticketAccess } from "./ticketQueries.service";
import { ticketSubject } from "./ticketRef";

/*
 * La démo seulement (DEMO_MODE=1, posé par le compose de la sandbox) : ce que la boîte noreply@
 * apporterait, sans boîte. La sandbox n'a pas de serveur IMAP (Mailpit reçoit les envois, il n'en
 * relève aucun) ni d'horloge à attendre : le visiteur déclenche lui-même la réponse du demandeur
 * et le récapitulatif.
 *
 * La réponse simulée passe par le VRAI traitement des e-mails reçus (processInboundEmail) : mêmes
 * règles de rattachement, même retrait de la partie citée, même refus d'un autre expéditeur.
 * Hors de la démo, les procédures qui l'appellent répondent « introuvable ».
 */
export function isDemoMail(): boolean {
  return process.env.DEMO_MODE === "1";
}

/** Une adresse qui n'est celle d'aucun demandeur : la démonstration du refus. */
const OTHER_SENDER = { email: "quelquun@ailleurs.example", name: "Quelqu'un d'autre" };

export type DemoReplyResult =
  | { kind: "added"; reopened: boolean }
  | { kind: "set-aside"; reason: Extract<InboundOutcome, { kind: "review" }>["reason"] }
  | { kind: "ignored" };

/**
 * Le demandeur (ou, `fromOther`, quelqu'un d'autre) répond par e-mail à la dernière réponse du
 * club : un message construit comme celui d'une messagerie (« Re: [AKFC-0042] … », en-têtes de
 * réponse, message cité en dessous), traité comme à la relève.
 */
export async function simulateRequesterReply(
  db: PrismaClient,
  ticketId: string,
  userId: string,
  fromOther: boolean,
): Promise<DemoReplyResult> {
  // Le droit de voir la demande : celui de la traiter.
  await getTicketDetail(db, ticketId, userId);
  const t = await db.ticket.findUniqueOrThrow({
    where: { id: ticketId },
    select: {
      number: true,
      subject: true,
      requesterEmail: true,
      requesterName: true,
      messages: {
        where: { direction: "OUT" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { emailMessageId: true, body: true, createdAt: true },
      },
    },
  });
  const last = t.messages[0];
  const quoted = last
    ? `\n\nLe ${last.createdAt.toLocaleDateString("fr-FR")}, le club a écrit :\n${last.body
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n")}`
    : "";
  const sender = fromOther ? OTHER_SENDER : { email: t.requesterEmail, name: t.requesterName };
  const mail = {
    messageId: `<demo-${randomUUID()}@sandbox.local>`,
    references: last?.emailMessageId ? [last.emailMessageId] : [],
    subject: `Re: ${ticketSubject(t.number, t.subject)}`,
    fromEmail: sender.email,
    fromName: sender.name,
    text: `Merci pour votre réponse, c'est noté. Bonne journée !${quoted}`,
    attachmentNames: [],
    autoReply: false,
  };
  const outcome = await processInboundEmail(db, mail);
  if (outcome.kind === "added") {
    // Le responsable est prévenu, comme à la relève : l'avis arrive dans Mailpit.
    await notifyClub(db, outcome, mail).catch((err) =>
      console.error("[tickets/demo] avis au club non envoyé :", err instanceof Error ? err.message : err),
    );
    return { kind: "added", reopened: outcome.reopened };
  }
  if (outcome.kind === "review") return { kind: "set-aside", reason: outcome.reason };
  return { kind: "ignored" };
}

/** Le récapitulatif du matin, tout de suite : à chacun, les demandes ouvertes de ses groupes. */
export async function sendDemoRecap(db: PrismaClient, userId: string): Promise<{ sent: number }> {
  const access = await ticketAccess(db, userId);
  if (!access.canHandle) return { sent: 0 };
  return { sent: await sendTicketRecaps(db) };
}
