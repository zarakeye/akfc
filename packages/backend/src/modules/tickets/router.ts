import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "#trpc/core.ts";
import { submitTicketSchema } from "@akfc/contracts/tickets/ticket.schema.ts";
import { sendTicketReply } from "#email/services/sendTicketEmails.ts";
import {
  canHandleCategory,
  cleanText,
  closeTicket,
  MAX_BODY,
  reopenTicket,
  replySignature,
  replyToTicket,
  takeTicket,
  transferTicket,
} from "#modules/tickets/tickets.service.ts";
import { getTicketDetail, listHandlers, listInbox, ticketAccess } from "#modules/tickets/ticketQueries.service.ts";
import { submitTicket } from "#modules/tickets/submitTicket.service.ts";

/**
 * Demandes adressées au club (formulaire de contact).
 * Réservé aux membres connectés, qui écrivent sous l'identité de leur compte ; le public écrit à
 * l'adresse du club. La procédure `submit` est publique pour que le piège à robots réponde
 * normalement à un visiteur : c'est le service qui refuse un visiteur humain.
 */
export const ticketRouter = router({
  /** Destinataires proposés par le formulaire (catégories actives, dans l'ordre). */
  categories: publicProcedure.query(({ ctx }) =>
    ctx.prisma.ticketCategory.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      select: { key: true, label: true },
    }),
  ),

  /**
   * Crée la demande puis envoie l'accusé de réception et l'avis au club. Un échec d'envoi
   * n'annule pas la demande (elle est enregistrée) : il est journalisé et signalé par
   * `acknowledged: false`.
   */
  submit: publicProcedure.input(submitTicketSchema).mutation(({ ctx, input }) =>
    submitTicket(ctx.prisma, {
      userId: ctx.sessionClient?.user?.id ?? null,
      categoryKey: input.categoryKey,
      subject: input.subject,
      body: input.body,
      website: input.website,
      requestIp: ctx.requestIp ?? null,
    }),
  ),

  /* ── Espace de traitement (membres d'un groupe responsable, administrateurs) ── */

  /** Accès à l'espace + compteurs (menu). Jamais d'erreur : `canHandle: false` si rien à traiter. */
  access: protectedProcedure.query(({ ctx }) => ticketAccess(ctx.prisma, ctx.sessionClient.user.id)),

  inbox: protectedProcedure
    .input(z.object({ scope: z.enum(["open", "mine", "unassigned", "closed"]).default("open") }))
    .query(({ ctx, input }) => listInbox(ctx.prisma, ctx.sessionClient.user.id, input.scope)),

  get: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => getTicketDetail(ctx.prisma, input.id, ctx.sessionClient.user.id)),

  handlers: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => listHandlers(ctx.prisma, input.id, ctx.sessionClient.user.id)),

  take: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => takeTicket(ctx.prisma, input.id, ctx.sessionClient.user.id)),

  transfer: protectedProcedure
    .input(z.object({ id: z.string().min(1), toUserId: z.string().min(1), note: z.string() }))
    .mutation(({ ctx, input }) =>
      transferTicket(ctx.prisma, input.id, ctx.sessionClient.user.id, input.toUserId, input.note),
    ),

  /**
   * Réponse au demandeur : l'e-mail part D'ABORD ; s'il échoue, rien n'est enregistré et le
   * membre peut réessayer. Signée du nom du membre connecté, au nom de la catégorie.
   */
  reply: protectedProcedure
    .input(z.object({ id: z.string().min(1), body: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;
      const t = await ctx.prisma.ticket.findUnique({
        where: { id: input.id },
        select: {
          id: true, number: true, subject: true, status: true, categoryId: true,
          requesterEmail: true, requesterName: true,
          category: { select: { label: true, replyTo: true } },
          messages: { where: { direction: "IN" }, orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true } },
        },
      });
      if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable." });
      if (!(await canHandleCategory(ctx.prisma, userId, t.categoryId))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne pouvez pas traiter cette demande." });
      }
      if (t.status === "CLOSED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cette demande est close : rouvrez-la avant de répondre." });
      }
      const text = cleanText(input.body, MAX_BODY, "La réponse");
      const authorName = await replySignature(ctx.prisma, userId, t.categoryId);

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
      const res = await replyToTicket(ctx.prisma, t.id, userId, text, messageId);
      return { ...res, emailed: messageId !== null };
    }),

  close: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => closeTicket(ctx.prisma, input.id, ctx.sessionClient.user.id)),

  reopen: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => reopenTicket(ctx.prisma, input.id, ctx.sessionClient.user.id)),
});
