import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { submitTicketSchema } from "@contracts/tickets/ticket.schema";
import { sendTicketAcknowledgement, sendTicketNotification, sendTicketReply } from "@backend/email/services/sendTicketEmails";
import {
  canHandleCategory,
  cleanText,
  closeTicket,
  createTicket,
  MAX_BODY,
  reopenTicket,
  replySignature,
  replyToTicket,
  takeTicket,
  transferTicket,
} from "@backend/modules/tickets/tickets.service";
import { getTicketDetail, listHandlers, listInbox, ticketAccess } from "@backend/modules/tickets/ticketQueries.service";
import { submitThrottle } from "@backend/modules/tickets/submitThrottle";

/**
 * Demandes adressées au club (formulaire de contact).
 * Public : un visiteur peut écrire ; un membre connecté écrit sous l'identité de son compte.
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
  submit: publicProcedure.input(submitTicketSchema).mutation(async ({ ctx, input }) => {
    // Robot qui remplit tout : réponse d'apparence normale, rien n'est créé.
    if (input.website && input.website.trim() !== "") {
      return { ref: null, dueAt: null, acknowledged: true };
    }

    const sessionUser = ctx.sessionClient?.user ?? null;
    let requester: { userId: string | null; email: string; name: string | null };
    if (sessionUser) {
      const u = await ctx.prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
      if (!u) throw new TRPCError({ code: "UNAUTHORIZED" });
      const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
      requester = { userId: u.id, email: u.email, name: full || null };
    } else {
      // Formulaire réservé aux membres connectés : le public écrit à l'adresse du club
      // (coordonnées de « Nous contacter »).
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Ce formulaire est réservé aux membres : connectez-vous, ou écrivez-nous à l'adresse indiquée sur la page « Nous contacter ».",
      });
    }

    if (submitThrottle.hit([ctx.requestIp ? `ip:${ctx.requestIp}` : null, `mail:${requester.email.toLowerCase()}`])) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Vous avez envoyé plusieurs messages en peu de temps. Réessayez dans une heure.",
      });
    }

    const created = await createTicket(ctx.prisma, {
      categoryKey: input.categoryKey,
      subject: input.subject,
      body: input.body,
      requester,
    });

    const [category, settings] = await Promise.all([
      ctx.prisma.ticketCategory.findUniqueOrThrow({
        where: { key: input.categoryKey },
        select: { label: true, replyTo: true },
      }),
      ctx.prisma.siteSettings.findUnique({ where: { id: "site" }, select: { ticketResponseDays: true } }),
    ]);
    const mail = {
      id: created.id,
      number: created.number,
      subject: input.subject.trim(),
      body: input.body.replace(/\r\n/g, "\n").trim(),
      dueAt: created.dueAt,
      responseDays: settings?.ticketResponseDays ?? 7,
      category,
      requester: { email: requester.email.toLowerCase(), name: requester.name, isMember: Boolean(sessionUser) },
    };

    const [ack, notice] = await Promise.allSettled([sendTicketAcknowledgement(mail), sendTicketNotification(mail)]);
    if (ack.status === "rejected") {
      console.error(`[tickets] accusé de réception ${created.ref} non envoyé :`, ack.reason instanceof Error ? ack.reason.message : ack.reason);
    }
    if (notice.status === "rejected") {
      console.error(`[tickets] avis au club ${created.ref} non envoyé :`, notice.reason instanceof Error ? notice.reason.message : notice.reason);
    }

    return { ref: created.ref, dueAt: created.dueAt, acknowledged: ack.status === "fulfilled" };
  }),

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
