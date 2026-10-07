import type { Prisma, PrismaClient, TicketStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { canHandleCategory, displayName } from "./tickets.service";
import { formatTicketRef } from "./ticketRef";

/*
 * Lectures de l'espace de traitement des demandes. On ne voit que les demandes des catégories
 * qu'on peut traiter : toutes pour un administrateur, sinon celles des groupes dont on est membre
 * direct.
 */

type Db = PrismaClient;
const nameSelect = { id: true, firstName: true, lastName: true, email: true } as const;

/** Catégories traitables par le membre ; `null` = toutes (administrateur). */
export async function handledCategoryIds(db: Db, userId: string): Promise<string[] | null> {
  if (await isAdminByGroup(db, userId)) return null;
  const cats = await db.ticketCategory.findMany({
    where: { group: { memberships: { some: { userId } } } },
    select: { id: true },
  });
  return cats.map((c) => c.id);
}

/** Accès à l'espace + nombre de demandes ouvertes (pour le menu). */
export async function ticketAccess(db: Db, userId: string) {
  const ids = await handledCategoryIds(db, userId);
  if (ids !== null && ids.length === 0) return { canHandle: false, open: 0, mine: 0, overdue: 0 };
  const scope: Prisma.TicketWhereInput = ids === null ? {} : { categoryId: { in: ids } };
  const open: Prisma.TicketWhereInput = { ...scope, status: { not: "CLOSED" } };
  const [openCount, mine, overdue] = await Promise.all([
    db.ticket.count({ where: open }),
    db.ticket.count({ where: { ...open, assigneeId: userId } }),
    db.ticket.count({ where: { ...open, firstResponseAt: null, dueAt: { lt: new Date() } } }),
  ]);
  return { canHandle: true, open: openCount, mine, overdue };
}

export type InboxScope = "open" | "mine" | "unassigned" | "closed";

export async function listInbox(db: Db, userId: string, scope: InboxScope) {
  const ids = await handledCategoryIds(db, userId);
  if (ids !== null && ids.length === 0) throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne traitez aucune catégorie de demandes." });
  const where: Prisma.TicketWhereInput = ids === null ? {} : { categoryId: { in: ids } };
  if (scope === "closed") where.status = "CLOSED";
  else {
    where.status = { not: "CLOSED" };
    if (scope === "mine") where.assigneeId = userId;
    if (scope === "unassigned") where.assigneeId = null;
  }
  const rows = await db.ticket.findMany({
    where,
    orderBy: scope === "closed" ? [{ closedAt: "desc" }] : [{ status: "asc" }, { dueAt: "asc" }],
    take: 200,
    select: {
      id: true, number: true, subject: true, status: true, dueAt: true, firstResponseAt: true,
      createdAt: true, updatedAt: true, closedAt: true, requesterEmail: true, requesterName: true, requesterId: true,
      category: { select: { key: true, label: true } },
      assignee: { select: nameSelect },
      _count: { select: { messages: true } },
    },
  });
  const now = Date.now();
  return rows.map((r) => ({
    id: r.id,
    ref: formatTicketRef(r.number),
    subject: r.subject,
    status: r.status as TicketStatus,
    category: r.category,
    requester: { name: r.requesterName, email: r.requesterEmail, isMember: r.requesterId !== null },
    assignee: r.assignee ? { id: r.assignee.id, name: displayName(r.assignee) } : null,
    dueAt: r.dueAt,
    answered: r.firstResponseAt !== null,
    overdue: r.status !== "CLOSED" && r.firstResponseAt === null && r.dueAt.getTime() < now,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    closedAt: r.closedAt,
    messageCount: r._count.messages,
  }));
}

export async function getTicketDetail(db: Db, ticketId: string, userId: string) {
  const t = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      category: { select: { id: true, key: true, label: true, replyTo: true } },
      assignee: { select: nameSelect },
      messages: { orderBy: { createdAt: "asc" }, include: { author: { select: nameSelect } } },
      events: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: nameSelect }, toUser: { select: nameSelect } },
      },
    },
  });
  if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable." });
  if (!(await canHandleCategory(db, userId, t.categoryId))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne pouvez pas traiter cette demande." });
  }
  return {
    id: t.id,
    ref: formatTicketRef(t.number),
    subject: t.subject,
    status: t.status,
    category: { key: t.category.key, label: t.category.label, replyTo: t.category.replyTo },
    requester: { name: t.requesterName, email: t.requesterEmail, isMember: t.requesterId !== null },
    assignee: t.assignee ? { id: t.assignee.id, name: displayName(t.assignee) } : null,
    dueAt: t.dueAt,
    firstResponseAt: t.firstResponseAt,
    overdue: t.status !== "CLOSED" && t.firstResponseAt === null && t.dueAt.getTime() < Date.now(),
    createdAt: t.createdAt,
    closedAt: t.closedAt,
    messages: t.messages.map((m) => ({
      id: m.id,
      direction: m.direction,
      authorName: m.author ? displayName(m.author) : (m.authorName ?? m.fromEmail ?? null),
      fromEmail: m.fromEmail,
      body: m.body,
      createdAt: m.createdAt,
    })),
    events: t.events.map((e) => ({
      id: e.id,
      type: e.type,
      actorName: e.actor ? displayName(e.actor) : null,
      toUserName: e.toUser ? displayName(e.toUser) : null,
      note: e.note,
      createdAt: e.createdAt,
    })),
  };
}

/** Personnes à qui transmettre la demande : administrateurs + membres directs du groupe de la catégorie. */
export async function listHandlers(db: Db, ticketId: string, userId: string) {
  const t = await db.ticket.findUnique({ where: { id: ticketId }, select: { categoryId: true, category: { select: { groupId: true } } } });
  if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable." });
  if (!(await canHandleCategory(db, userId, t.categoryId))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne pouvez pas traiter cette demande." });
  }
  const users = await db.user.findMany({
    where: {
      memberGroupMemberships: {
        some: { OR: [{ groupId: t.category.groupId }, { group: { isAdminGroup: true } }] },
      },
    },
    select: nameSelect,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { email: "asc" }],
  });
  return users.map((u) => ({ id: u.id, name: displayName(u), email: u.email, isSelf: u.id === userId }));
}
