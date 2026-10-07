import { TRPCError } from "@trpc/server";

import { router, publicProcedure } from "@backend/trpc/core";
import { submitTicketSchema } from "@contracts/tickets/ticket.schema";
import { sendTicketAcknowledgement, sendTicketNotification } from "@backend/email/services/sendTicketEmails";
import { createTicket } from "@backend/modules/tickets/tickets.service";
import { isThrottled } from "@backend/modules/tickets/submitThrottle";

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
      const email = input.email?.trim() ?? "";
      if (!email) throw new TRPCError({ code: "BAD_REQUEST", message: "Indiquez votre adresse e-mail pour recevoir la réponse." });
      requester = { userId: null, email, name: input.name?.trim() || null };
    }

    if (isThrottled([ctx.requestIp ? `ip:${ctx.requestIp}` : null, `mail:${requester.email.toLowerCase()}`])) {
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
});
