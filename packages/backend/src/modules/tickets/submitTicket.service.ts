import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { sendTicketAcknowledgement, sendTicketNotification } from "#email/services/sendTicketEmails.ts";
import { createTicket } from "#modules/tickets/tickets.service.ts";
import { submitThrottle } from "#modules/tickets/submitThrottle.ts";

export type SubmitTicketResult = { ref: string | null; dueAt: Date | null; acknowledged: boolean };

/**
 * Dépôt d'une demande depuis le formulaire « Écrire au club ».
 *
 * Crée la demande puis envoie l'accusé de réception et l'avis au club. Un échec d'envoi
 * n'annule pas la demande (elle est enregistrée) : il est journalisé et signalé par
 * `acknowledged: false`.
 *
 * Appelée par la server action du formulaire (site web) et par la procédure tRPC ticket.submit
 * (tests, future application mobile). Les refus (visiteur non connecté, envois en rafale, champ
 * invalide) sont des TRPCError, comme dans tout le service des demandes ; chaque entrée les
 * présente à sa façon.
 */
export async function submitTicket(
  db: PrismaClient,
  input: {
    userId: string | null;
    categoryKey: string;
    subject: string;
    body: string;
    website?: string;
    requestIp: string | null;
  },
): Promise<SubmitTicketResult> {
  // Robot qui remplit tout : réponse d'apparence normale, rien n'est créé.
  if (input.website && input.website.trim() !== "") {
    return { ref: null, dueAt: null, acknowledged: true };
  }

  let requester: { userId: string | null; email: string; name: string | null };
  if (input.userId) {
    const u = await db.user.findUnique({
      where: { id: input.userId },
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

  if (submitThrottle.hit([input.requestIp ? `ip:${input.requestIp}` : null, `mail:${requester.email.toLowerCase()}`])) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Vous avez envoyé plusieurs messages en peu de temps. Réessayez dans une heure.",
    });
  }

  const created = await createTicket(db, {
    categoryKey: input.categoryKey,
    subject: input.subject,
    body: input.body,
    requester,
  });

  const [category, settings] = await Promise.all([
    db.ticketCategory.findUniqueOrThrow({
      where: { key: input.categoryKey },
      select: { label: true, replyTo: true },
    }),
    db.siteSettings.findUnique({ where: { id: "site" }, select: { ticketResponseDays: true } }),
  ]);
  const mail = {
    id: created.id,
    number: created.number,
    subject: input.subject.trim(),
    body: input.body.replace(/\r\n/g, "\n").trim(),
    dueAt: created.dueAt,
    responseDays: settings?.ticketResponseDays ?? 7,
    category,
    requester: { email: requester.email.toLowerCase(), name: requester.name, isMember: true },
  };

  const [ack, notice] = await Promise.allSettled([sendTicketAcknowledgement(mail), sendTicketNotification(mail)]);
  if (ack.status === "rejected") {
    console.error(`[tickets] accusé de réception ${created.ref} non envoyé :`, ack.reason instanceof Error ? ack.reason.message : ack.reason);
  }
  if (notice.status === "rejected") {
    console.error(`[tickets] avis au club ${created.ref} non envoyé :`, notice.reason instanceof Error ? notice.reason.message : notice.reason);
  }

  return { ref: created.ref, dueAt: created.dueAt, acknowledged: ack.status === "fulfilled" };
}
