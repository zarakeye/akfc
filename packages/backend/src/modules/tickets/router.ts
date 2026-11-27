import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "#trpc/core.ts";
import { replyTicketSchema, submitTicketSchema, transferTicketSchema } from "@akfc/contracts/tickets/ticket.schema.ts";
import { closeTicket, reopenTicket, takeTicket, transferTicket } from "#modules/tickets/tickets.service.ts";
import { answerTicket } from "#modules/tickets/answerTicket.service.ts";
import { getTicketDetail, listHandlers, listInbox, ticketAccess } from "#modules/tickets/ticketQueries.service.ts";
import { submitTicket } from "#modules/tickets/submitTicket.service.ts";
import { isDemoMail, sendDemoRecap, simulateRequesterReply } from "#modules/tickets/demoMail.service.ts";

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
    .input(transferTicketSchema)
    .mutation(({ ctx, input }) =>
      transferTicket(ctx.prisma, input.id, ctx.sessionClient.user.id, input.toUserId, input.note),
    ),

  /**
   * Réponse au demandeur : l'e-mail part D'ABORD ; s'il échoue, rien n'est enregistré et le
   * membre peut réessayer. La logique est dans le service, partagé avec la server action du
   * formulaire de réponse.
   */
  reply: protectedProcedure
    .input(replyTicketSchema)
    .mutation(({ ctx, input }) =>
      answerTicket(ctx.prisma, { ticketId: input.id, userId: ctx.sessionClient.user.id, body: input.body }),
    ),

  close: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => closeTicket(ctx.prisma, input.id, ctx.sessionClient.user.id)),

  reopen: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => reopenTicket(ctx.prisma, input.id, ctx.sessionClient.user.id)),

  /* ── La démo seulement (DEMO_MODE=1) : la boîte noreply@ et l'horloge, à la demande ── */

  /** Le demandeur répond par e-mail (ou quelqu'un d'autre, `fromOther`) : voir demoMail.service. */
  demoReply: protectedProcedure
    .input(z.object({ id: z.string().min(1), fromOther: z.boolean().default(false) }))
    .mutation(({ ctx, input }) => {
      if (!isDemoMail()) throw new TRPCError({ code: "NOT_FOUND" });
      return simulateRequesterReply(ctx.prisma, input.id, ctx.sessionClient.user.id, input.fromOther);
    }),

  /** Le récapitulatif du matin, maintenant. */
  demoRecap: protectedProcedure.mutation(({ ctx }) => {
    if (!isDemoMail()) throw new TRPCError({ code: "NOT_FOUND" });
    return sendDemoRecap(ctx.prisma, ctx.sessionClient.user.id);
  }),
});
