import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";
import { assertCanWriteGroupSpace } from "@backend/modules/memberGroups/assertCanWriteGroupSpace.service";

/**
 * Documents membres : fichiers du finder mis à disposition des membres, avec
 * statut de lecture par membre.
 *
 * Modèle : `MemberDocument` (surcouche sur un MediaAsset) ; audience
 * ALL_MEMBERS (tous, nouveaux inclus d'office) ou SPECIFIC (destinataires
 * explicites = perso aujourd'hui, bureau demain) ; `DocumentReceipt` = lu/non
 * lu par membre (absence de ligne ou readAt null = non lu).
 */

const adminProcedure = protectedProcedure.use(isAdmin);

/** Condition Prisma « ce document concerne l'utilisateur ». */
function visibleToUser(userId: string) {
  return {
    OR: [
      { audience: "ALL_MEMBERS" as const },
      {
        audience: "SPECIFIC" as const,
        // Ciblé : destinataire ad hoc OU membre d'un groupe visé (appartenance
        // résolue dynamiquement → un membre ajouté au groupe hérite des docs
        // déjà posés).
        OR: [
          { recipients: { some: { userId } } },
          {
            groups: { some: { group: { memberships: { some: { userId } } } } },
          },
        ],
      },
    ],
  };
}

export const memberDocumentRouter = router({
  // ─── Membre ────────────────────────────────────────────────────────────

  /** Documents visibles par le membre courant, avec son statut de lecture. */
  listForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const myGroupIds = new Set(
      (
        await ctx.prisma.memberGroupMembership.findMany({
          where: { userId },
          select: { groupId: true },
        })
      ).map((m) => m.groupId),
    );
    const docs = await ctx.prisma.memberDocument.findMany({
      where: visibleToUser(userId),
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        audience: true,
        publishedAt: true,
        mediaAsset: {
          select: {
            displayName: true,
            originalFileName: true,
            mimeType: true,
            format: true,
          },
        },
        receipts: { where: { userId }, select: { readAt: true } },
        recipients: { where: { userId }, select: { userId: true } },
        groups: { select: { group: { select: { id: true, name: true } } } },
      },
    });

    return docs.map((d) => ({
      id: d.id,
      title:
        d.title ?? d.mediaAsset.displayName ?? d.mediaAsset.originalFileName,
      audience: d.audience,
      publishedAt: d.publishedAt,
      mimeType: d.mediaAsset.mimeType,
      format: d.mediaAsset.format,
      // Pas de reçu, ou reçu à readAt null (re-marqué non lu) = non lu.
      readAt: d.receipts[0]?.readAt ?? null,
      // Destinataire direct (document personnel) ?
      personal: d.recipients.length > 0,
      // Groupes visés dont ce membre fait partie (par quel groupe il l'a reçu).
      groups: d.groups.map((g) => g.group).filter((g) => myGroupIds.has(g.id)),
    }));
  }),

  /** Nombre de documents non lus (pour la cloche). */
  unreadCountForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const me = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { memberSince: true },
    });
    // Borne = 1er janvier de l'ANNÉE d'adhésion (pas la date exacte) : un membre
    // qui adhère après la dernière AG doit quand même être invité à lire le
    // compte rendu de la même année. Les documents antérieurs restent listés
    // sur la page (lecture volontaire). memberSince null → pas de borne.
    const yearStart = me?.memberSince
      ? new Date(Date.UTC(me.memberSince.getUTCFullYear(), 0, 1))
      : null;
    return ctx.prisma.memberDocument.count({
      where: {
        ...visibleToUser(userId),
        // Non lu = aucun reçu daté pour ce membre.
        receipts: { none: { userId, readAt: { not: null } } },
        ...(yearStart ? { publishedAt: { gte: yearStart } } : {}),
      },
    });
  }),

  /**
   * Compteur de la CLOCHE collaborative : documents non lus ciblant les
   * groupes collaboratifs accessibles au membre (héritage compris), hors
   * ses propres dépôts. Distinct de « Documents » (perso/diffusion).
   */
  collaborativeUnreadCountForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const entries = await collaborativeEntriesForMember(ctx.prisma, userId);
    const groupIds = entries.map((e) => e.groupId);
    if (groupIds.length === 0) return 0;

    return ctx.prisma.memberDocument.count({
      where: {
        groups: { some: { groupId: { in: groupIds } } },
        receipts: { none: { userId, readAt: { not: null } } },
        NOT: { publishedById: userId },
      },
    });
  }),

  /** Non-lus ventilés : généraux (ALL_MEMBERS, bornés à l'année d'adhésion) et
   *  persos (SPECIFIC pour ce membre, toujours signalés). Pour le badge de
   *  l'item « Documents » de la navbar. */
  unreadBreakdownForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const me = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { memberSince: true },
    });
    const yearStart = me?.memberSince
      ? new Date(Date.UTC(me.memberSince.getUTCFullYear(), 0, 1))
      : null;
    const unread = { receipts: { none: { userId, readAt: { not: null } } } };
    const generalBound = yearStart ? { publishedAt: { gte: yearStart } } : {};

    const myGroups = await ctx.prisma.memberGroupMembership.findMany({
      where: { userId },
      select: { group: { select: { id: true, name: true } } },
    });

    const [general, perso, total, ...groupCounts] = await Promise.all([
      ctx.prisma.memberDocument.count({
        where: { audience: "ALL_MEMBERS" as const, ...unread, ...generalBound },
      }),
      ctx.prisma.memberDocument.count({
        where: {
          audience: "SPECIFIC" as const,
          recipients: { some: { userId } },
          ...unread,
        },
      }),
      // Total DISTINCT (un doc atteignant le membre par plusieurs canaux compté
      // une seule fois) : sert au badge.
      ctx.prisma.memberDocument.count({
        where: {
          ...unread,
          OR: [
            { audience: "ALL_MEMBERS" as const, ...generalBound },
            {
              audience: "SPECIFIC" as const,
              OR: [
                { recipients: { some: { userId } } },
                {
                  groups: {
                    some: { group: { memberships: { some: { userId } } } },
                  },
                },
              ],
            },
          ],
        },
      }),
      ...myGroups.map(({ group }) =>
        ctx.prisma.memberDocument.count({
          where: {
            audience: "SPECIFIC" as const,
            groups: { some: { groupId: group.id } },
            ...unread,
          },
        }),
      ),
    ]);

    const byGroup = myGroups
      .map(({ group }, i) => ({
        groupId: group.id,
        name: group.name,
        count: groupCounts[i] ?? 0,
      }))
      .filter((g) => g.count > 0);

    return { general, perso, total, byGroup };
  }),

  /** Marquer lu (à l'ouverture de l'aperçu). */
  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;
      const visible = await ctx.prisma.memberDocument.findFirst({
        where: { id: input.id, ...visibleToUser(userId) },
        select: { id: true },
      });
      if (!visible) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document introuvable." });
      }
      await ctx.prisma.documentReceipt.upsert({
        where: { memberDocumentId_userId: { memberDocumentId: input.id, userId } },
        create: { memberDocumentId: input.id, userId, readAt: new Date() },
        update: { readAt: new Date() },
      });
      return { success: true };
    }),

  /** Re-marquer non lu (garde le signal de la cloche pour y revenir). */
  markUnread: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;
      const visible = await ctx.prisma.memberDocument.findFirst({
        where: { id: input.id, ...visibleToUser(userId) },
        select: { id: true },
      });
      if (!visible) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document introuvable." });
      }
      await ctx.prisma.documentReceipt.upsert({
        where: { memberDocumentId_userId: { memberDocumentId: input.id, userId } },
        create: { memberDocumentId: input.id, userId, readAt: null },
        update: { readAt: null },
      });
      return { success: true };
    }),

  // ─── Admin ─────────────────────────────────────────────────────────────

  /** Met un fichier du finder à disposition des membres. */
  publish: adminProcedure
    .input(
      z.object({
        path: z.string(),
        title: z.string().trim().max(300).optional(),
        audience: z.enum(["ALL_MEMBERS", "SPECIFIC"]),
        recipientUserIds: z.array(z.string()).optional(),
        groupIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const recipientIds =
        input.audience === "SPECIFIC" ? (input.recipientUserIds ?? []) : [];
      const groupIds =
        input.audience === "SPECIFIC" ? (input.groupIds ?? []) : [];
      if (
        input.audience === "SPECIFIC" &&
        recipientIds.length === 0 &&
        groupIds.length === 0
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Choisissez au moins un groupe ou un membre.",
        });
      }

      // Résolution par chemin logique, tolérante à l'extension (comme
      // media.updateDescription) : le finder fournit un chemin, pas un id.
      const asset = await ctx.prisma.mediaAsset.findFirst({
        where: {
          OR: [
            { fullPath: input.path },
            { fullPath: { startsWith: `${input.path}.` } },
          ],
        },
        select: { id: true },
      });
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Fichier introuvable." });
      }

      const existing = await ctx.prisma.memberDocument.findUnique({
        where: { mediaAssetId: asset.id },
        select: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ce fichier est déjà mis à disposition des membres.",
        });
      }

      const doc = await ctx.prisma.memberDocument.create({
        data: {
          mediaAssetId: asset.id,
          title: input.title,
          audience: input.audience,
          publishedById: ctx.sessionClient.user.id,
          recipients: { create: recipientIds.map((id) => ({ userId: id })) },
          groups: { create: groupIds.map((id) => ({ groupId: id })) },
        },
        select: { id: true },
      });
      return { id: doc.id };
    }),

  /**
   * Dépôt d'un fichier dans l'espace d'un groupe collaboratif par un
   * ÉDITEUR (ou admin) : publie le MediaAsset comme MemberDocument ciblé
   * sur CE groupe, pour que tout le système documents (reçus, badges,
   * cloche) s'applique. Idempotent doux (ne re-publie pas un asset déjà
   * mis à disposition).
   */
  depositToGroupSpace: protectedProcedure
    .input(
      z.object({
        path: z.string(),
        groupId: z.string(),
        title: z.string().trim().max(300).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertCanWriteGroupSpace({
        prisma: ctx.prisma,
        userId: ctx.sessionClient.user.id,
        groupId: input.groupId,
      });

      const asset = await ctx.prisma.mediaAsset.findFirst({
        where: {
          OR: [
            { fullPath: input.path },
            { fullPath: { startsWith: `${input.path}.` } },
          ],
        },
        select: { id: true },
      });
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Fichier introuvable." });
      }

      const existing = await ctx.prisma.memberDocument.findUnique({
        where: { mediaAssetId: asset.id },
        select: { id: true },
      });
      if (existing) {
        return { id: existing.id, alreadyPublished: true };
      }

      const doc = await ctx.prisma.memberDocument.create({
        data: {
          mediaAssetId: asset.id,
          title: input.title,
          audience: "SPECIFIC",
          publishedById: ctx.sessionClient.user.id,
          groups: { create: [{ groupId: input.groupId }] },
        },
        select: { id: true },
      });
      return { id: doc.id, alreadyPublished: false };
    }),

  /** Retire la mise à disposition (cascade reçus + destinataires). */
  unpublish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberDocument.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /** Liste admin de tous les documents mis à disposition. */
  listAdmin: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.memberDocument.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        audience: true,
        publishedAt: true,
        mediaAsset: { select: { displayName: true, originalFileName: true } },
        _count: { select: { recipients: true, receipts: true } },
      },
    });
  }),

  /** Membres, pour choisir les destinataires d'une diffusion restreinte. */
  listMembers: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { email: "asc" }],
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return users.map((u) => ({
      id: u.id,
      name:
        [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
    }));
  }),

  /** État de mise à disposition d'un fichier (pour le menu du finder). */
  publicationForPath: adminProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.mediaAsset.findFirst({
        where: {
          OR: [
            { fullPath: input.path },
            { fullPath: { startsWith: `${input.path}.` } },
          ],
        },
        select: { id: true },
      });
      if (!asset) return null;
      return ctx.prisma.memberDocument.findUnique({
        where: { mediaAssetId: asset.id },
        select: {
          id: true,
          audience: true,
          _count: { select: { recipients: true } },
        },
      });
    }),
});
