import { Prisma, type PrismaClient, type TicketStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { formatTicketRef } from "./ticketRef";

/*
 * Socle des demandes (tickets) : règles métier, sans envoi d'e-mail (les notifications
 * s'appuieront sur ces fonctions). Toute écriture se fait en transaction, avec son évènement
 * d'historique.
 *
 * Règles :
 *   - un numéro par demande, jamais modifié ;
 *   - l'échéance (dueAt) est celle de la PREMIÈRE réponse, fixée à la création et jamais
 *     repoussée, même par un transfert ;
 *   - peut traiter une demande : un administrateur, ou un membre DIRECT du groupe de sa catégorie ;
 *   - un transfert exige une note ;
 *   - un message du demandeur sur une demande close la rouvre.
 */

const DEFAULT_RESPONSE_DAYS = 7;
const MAX_SUBJECT = 200;
export const MAX_BODY = 20_000;

type Db = PrismaClient;

function bad(message: string): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}
function forbidden(message = "Vous ne pouvez pas traiter cette demande."): never {
  throw new TRPCError({ code: "FORBIDDEN", message });
}
function notFound(): never {
  throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable." });
}
export function cleanText(value: string, max: number, field: string): string {
  const v = value.replace(/\r\n/g, "\n").trim();
  if (!v) bad(`${field} est vide.`);
  if (v.length > max) bad(`${field} dépasse ${max} caractères.`);
  return v;
}
export function displayName(u: { firstName: string | null; lastName: string | null; email: string }): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

/** Vrai si le membre peut traiter les demandes de la catégorie (admin, ou membre direct du groupe). */
export async function canHandleCategory(db: Db, userId: string, categoryId: string): Promise<boolean> {
  if (await isAdminByGroup(db, userId)) return true;
  const membership = await db.memberGroupMembership.findFirst({
    where: { userId, group: { ticketCategories: { some: { id: categoryId } } } },
    select: { id: true },
  });
  return membership !== null;
}

async function loadForHandler(db: Db, ticketId: string, userId: string) {
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, number: true, status: true, categoryId: true, assigneeId: true, firstResponseAt: true },
  });
  if (!ticket) notFound();
  if (!(await canHandleCategory(db, userId, ticket.categoryId))) forbidden();
  return ticket;
}

/* ── Création ───────────────────────────────────────────────────────── */

export type CreateTicketInput = {
  categoryKey: string;
  subject: string;
  body: string;
  /** Demandeur : membre connecté (userId) ou personne extérieure (e-mail seul). */
  requester: { userId?: string | null; email: string; name?: string | null };
  /** Message-ID de l'e-mail d'origine (demande arrivée par e-mail). */
  emailMessageId?: string | null;
};

export async function createTicket(db: Db, input: CreateTicketInput) {
  const subject = cleanText(input.subject, MAX_SUBJECT, "L'objet");
  const body = cleanText(input.body, MAX_BODY, "Le message");
  const email = input.requester.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad("Adresse e-mail du demandeur invalide.");
  const name = input.requester.name?.trim() || null;

  const category = await db.ticketCategory.findUnique({
    where: { key: input.categoryKey },
    select: { id: true, isActive: true },
  });
  if (!category || !category.isActive) bad("Catégorie de demande inconnue.");

  const settings = await db.siteSettings.findUnique({ where: { id: "site" }, select: { ticketResponseDays: true } });
  const days = settings?.ticketResponseDays ?? DEFAULT_RESPONSE_DAYS;
  const now = new Date();
  const dueAt = new Date(now.getTime() + days * 24 * 3600 * 1000);
  const requesterId = input.requester.userId ?? null;

  const ticket = await db.$transaction(async (tx) => {
    const t = await tx.ticket.create({
      data: {
        subject,
        categoryId: category.id,
        requesterId,
        requesterEmail: email,
        requesterName: name,
        dueAt,
        createdAt: now,
        messages: {
          create: {
            direction: "IN",
            authorId: requesterId,
            authorName: name,
            fromEmail: email,
            body,
            emailMessageId: input.emailMessageId ?? null,
            createdAt: now,
          },
        },
        events: { create: { type: "CREATED", actorId: requesterId, createdAt: now } },
      },
      select: { id: true, number: true, dueAt: true },
    });
    return t;
  });
  return { ...ticket, ref: formatTicketRef(ticket.number) };
}

/* ── Prise en charge et passage de relais ───────────────────────────── */

export async function takeTicket(db: Db, ticketId: string, userId: string) {
  const t = await loadForHandler(db, ticketId, userId);
  if (t.status === "CLOSED") bad("Cette demande est close.");
  if (t.assigneeId === userId) return { changed: false };
  await db.$transaction([
    db.ticket.update({
      where: { id: t.id },
      data: { assigneeId: userId, status: t.status === "WAITING" ? "IN_PROGRESS" : t.status },
    }),
    db.ticketEvent.create({ data: { ticketId: t.id, type: "TAKEN", actorId: userId } }),
  ]);
  return { changed: true };
}

export async function transferTicket(db: Db, ticketId: string, actorId: string, toUserId: string, note: string) {
  const t = await loadForHandler(db, ticketId, actorId);
  if (t.status === "CLOSED") bad("Cette demande est close.");
  const cleanNote = cleanText(note, 2_000, "La note de transfert");
  if (toUserId === t.assigneeId) bad("Cette personne est déjà responsable de la demande.");
  if (!(await canHandleCategory(db, toUserId, t.categoryId))) {
    bad("Cette personne ne fait pas partie du groupe responsable de cette catégorie.");
  }
  await db.$transaction([
    db.ticket.update({
      where: { id: t.id },
      // L'échéance (dueAt) n'est PAS modifiée : le délai promis ne repart pas à zéro.
      data: { assigneeId: toUserId, status: t.status === "WAITING" ? "IN_PROGRESS" : t.status },
    }),
    db.ticketEvent.create({
      data: { ticketId: t.id, type: "TRANSFERRED", actorId, toUserId, note: cleanNote },
    }),
  ]);
  return { changed: true };
}

/* ── Messages ───────────────────────────────────────────────────────── */

/** Réponse du club. Sans responsable, l'auteur devient responsable. */
export async function replyToTicket(
  db: Db,
  ticketId: string,
  authorId: string,
  body: string,
  /** Message-ID de l'e-mail parti au demandeur : servira à rattacher sa réponse. */
  emailMessageId?: string | null,
) {
  const t = await loadForHandler(db, ticketId, authorId);
  if (t.status === "CLOSED") bad("Cette demande est close : rouvrez-la avant de répondre.");
  const text = cleanText(body, MAX_BODY, "La réponse");
  const author = await db.user.findUnique({
    where: { id: authorId },
    select: { firstName: true, lastName: true, email: true },
  });
  if (!author) forbidden();
  const now = new Date();

  const message = await db.$transaction(async (tx) => {
    if (!t.assigneeId) {
      await tx.ticketEvent.create({ data: { ticketId: t.id, type: "TAKEN", actorId: authorId, createdAt: now } });
    }
    const m = await tx.ticketMessage.create({
      data: { ticketId: t.id, direction: "OUT", authorId, authorName: displayName(author), body: text, emailMessageId: emailMessageId ?? null, createdAt: now },
      select: { id: true, createdAt: true },
    });
    await tx.ticket.update({
      where: { id: t.id },
      data: {
        status: "ANSWERED",
        assigneeId: t.assigneeId ?? authorId,
        firstResponseAt: t.firstResponseAt ?? now,
      },
    });
    await tx.ticketEvent.create({ data: { ticketId: t.id, type: "MESSAGE_OUT", actorId: authorId, createdAt: now } });
    return m;
  });
  return { messageId: message.id, ref: formatTicketRef(t.number) };
}

export type IncomingMessageInput = {
  ticketId: string;
  body: string;
  fromEmail: string;
  authorId?: string | null;
  authorName?: string | null;
  emailMessageId?: string | null;
};

/**
 * Message du demandeur (formulaire ou e-mail). Une demande close est rouverte ; une demande
 * « répondue » repasse « en cours » (ou « en attente » sans responsable). Un Message-ID déjà
 * importé est ignoré (relève de boîte rejouée).
 */
export async function addIncomingMessage(db: Db, input: IncomingMessageInput) {
  const text = cleanText(input.body, MAX_BODY, "Le message");
  if (input.emailMessageId) {
    const dup = await db.ticketMessage.findUnique({ where: { emailMessageId: input.emailMessageId }, select: { id: true } });
    if (dup) return { duplicate: true as const };
  }
  const t = await db.ticket.findUnique({
    where: { id: input.ticketId },
    select: { id: true, status: true, assigneeId: true },
  });
  if (!t) notFound();
  const next: TicketStatus = t.assigneeId ? "IN_PROGRESS" : "WAITING";
  const reopen = t.status === "CLOSED";
  const now = new Date();
  try {
    await db.$transaction(async (tx) => {
      await tx.ticketMessage.create({
        data: {
          ticketId: t.id,
          direction: "IN",
          authorId: input.authorId ?? null,
          authorName: input.authorName ?? null,
          fromEmail: input.fromEmail.trim().toLowerCase(),
          body: text,
          emailMessageId: input.emailMessageId ?? null,
          createdAt: now,
        },
      });
      await tx.ticket.update({
        where: { id: t.id },
        data: {
          status: t.status === "ANSWERED" || reopen ? next : t.status,
          ...(reopen ? { closedAt: null } : {}),
        },
      });
      if (reopen) {
        await tx.ticketEvent.create({ data: { ticketId: t.id, type: "REOPENED", actorId: input.authorId ?? null, createdAt: now } });
      }
      await tx.ticketEvent.create({ data: { ticketId: t.id, type: "MESSAGE_IN", actorId: input.authorId ?? null, createdAt: now } });
    });
  } catch (err) {
    // Course entre deux relèves : le même Message-ID importé en parallèle.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return { duplicate: true as const };
    throw err;
  }
  return { duplicate: false as const, reopened: reopen };
}

/* ── Clôture / réouverture ──────────────────────────────────────────── */

/** Réouverture par le club (une demande close à tort). Le demandeur, lui, rouvre en écrivant. */
export async function reopenTicket(db: Db, ticketId: string, userId: string) {
  const t = await loadForHandler(db, ticketId, userId);
  if (t.status !== "CLOSED") return { changed: false };
  const now = new Date();
  await db.$transaction([
    db.ticket.update({
      where: { id: t.id },
      data: { status: t.assigneeId ? "IN_PROGRESS" : "WAITING", closedAt: null },
    }),
    db.ticketEvent.create({ data: { ticketId: t.id, type: "REOPENED", actorId: userId, createdAt: now } }),
  ]);
  return { changed: true };
}

export async function closeTicket(db: Db, ticketId: string, userId: string) {
  const t = await loadForHandler(db, ticketId, userId);
  if (t.status === "CLOSED") return { changed: false };
  const now = new Date();
  await db.$transaction([
    db.ticket.update({ where: { id: t.id }, data: { status: "CLOSED", closedAt: now } }),
    db.ticketEvent.create({ data: { ticketId: t.id, type: "CLOSED", actorId: userId, createdAt: now } }),
  ]);
  return { changed: true };
}
