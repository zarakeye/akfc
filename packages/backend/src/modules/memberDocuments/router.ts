import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

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
      { audience: "SPECIFIC" as const, recipients: { some: { userId } } },
    ],
  };
}

export const memberDocumentRouter = router({
  // ─── Membre ────────────────────────────────────────────────────────────

  /** Documents visibles par le membre courant, avec son statut de lecture. */
  listForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
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
        mediaAssetId: z.string(),
        title: z.string().trim().max(300).optional(),
        audience: z.enum(["ALL_MEMBERS", "SPECIFIC"]),
        recipientUserIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.audience === "SPECIFIC" &&
        (!input.recipientUserIds || input.recipientUserIds.length === 0)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Au moins un destinataire est requis pour une diffusion restreinte.",
        });
      }

      const asset = await ctx.prisma.mediaAsset.findUnique({
        where: { id: input.mediaAssetId },
        select: { id: true },
      });
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Fichier introuvable." });
      }

      const existing = await ctx.prisma.memberDocument.findUnique({
        where: { mediaAssetId: input.mediaAssetId },
        select: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ce fichier est déjà mis à disposition des membres.",
        });
      }

      const recipientIds =
        input.audience === "SPECIFIC" ? (input.recipientUserIds ?? []) : [];

      const doc = await ctx.prisma.memberDocument.create({
        data: {
          mediaAssetId: input.mediaAssetId,
          title: input.title,
          audience: input.audience,
          publishedById: ctx.sessionClient.user.id,
          recipients: { create: recipientIds.map((id) => ({ userId: id })) },
        },
        select: { id: true },
      });
      return { id: doc.id };
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
});
