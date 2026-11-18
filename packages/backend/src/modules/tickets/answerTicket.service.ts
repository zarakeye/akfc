import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { sendTicketReply } from "#email/services/sendTicketEmails.ts";
import {
  canHandleCategory,
  cleanText,
  MAX_BODY,
  replySignature,
  replyToTicket,
} from "#modules/tickets/tickets.service.ts";

/**
 * Répond au demandeur, depuis le site. Deux entrées l'appellent : la procédure tRPC ticket.reply
 * (tests, future application mobile) et la server action du formulaire de réponse. Toutes deux
 * passent le membre connecté, lu dans sa session ; c'est ICI qu'on vérifie qu'il traite cette
 * catégorie.
 *
 * L'e-mail part D'ABORD ; s'il échoue, rien n'est enregistré et le membre peut réessayer.
 * Signée du nom du membre, au nom de la catégorie.
 */
export async function answerTicket(
  db: PrismaClient,
  { ticketId, userId, body }: { ticketId: string; userId: string; body: string },
) {
  const t = await db.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true, number: true, subject: true, status: true, categoryId: true,
      requesterEmail: true, requesterName: true,
      category: { select: { label: true, replyTo: true } },
      messages: { where: { direction: "IN" }, orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true } },
    },
  });
  if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable." });
  if (!(await canHandleCategory(db, userId, t.categoryId))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne pouvez pas traiter cette demande." });
  }
  if (t.status === "CLOSED") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Cette demande est close : rouvrez-la avant de répondre." });
  }
  const text = cleanText(body, MAX_BODY, "La réponse");
  const authorName = await replySignature(db, userId, t.categoryId);

  let messageId: string | null;
  try {
    messageId = await sendTicketReply({
      number: t.number,
      subject: t.subject,
      body: text,
      authorName,
      category: t.category,
      to: { email: t.requesterEmail, name: t.requesterName },
      quoted: t.messages[0] ?? null,
    });
  } catch (err) {
    console.error(`[tickets] réponse à la demande ${t.number} non envoyée :`, err instanceof Error ? err.message : err);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "L'e-mail n'a pas pu partir : votre réponse n'a pas été enregistrée. Réessayez dans un instant.",
    });
  }
  const res = await replyToTicket(db, t.id, userId, text, messageId);
  return { ...res, emailed: messageId !== null };
}
