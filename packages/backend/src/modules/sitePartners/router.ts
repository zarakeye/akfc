import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import {
  isSafeHttpUrl,
  LOGO_MIME_TYPES,
  logoUrlOf,
  parseLinks,
  validateLogo,
} from "@backend/modules/sitePartners/sitePartners.service";

async function assertAdmin(ctx: { prisma: PrismaClient; user: { id: string } }): Promise<void> {
  if (!(await isAdminByGroup(ctx.prisma, ctx.user.id))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Réservé aux administrateurs." });
  }
}

const httpUrl = z.string().trim().max(500).refine(isSafeHttpUrl, "Adresse web invalide (http:// ou https://).");

const partnerSelect = {
  id: true, name: true, role: true, description: true, websiteUrl: true, links: true,
  logoMime: true, logoUpdatedAt: true, position: true, isActive: true,
} as const;

/**
 * Partenaires du club (MJC, fédération…). Lecture PUBLIQUE des partenaires actifs (pied de page,
 * page d'inscription) ; gestion réservée aux administrateurs (Réglages du site).
 */
export const sitePartnerRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.sitePartner.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: partnerSelect,
    });
    return rows.map(({ logoMime, logoUpdatedAt, links, ...p }) => ({
      ...p,
      links: parseLinks(links),
      logoUrl: logoUrlOf({ id: p.id, logoMime, logoUpdatedAt }),
    }));
  }),

  listAdmin: protectedProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx);
    const rows = await ctx.prisma.sitePartner.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: partnerSelect,
    });
    return rows.map(({ logoMime, logoUpdatedAt, links, ...p }) => ({
      ...p,
      links: parseLinks(links),
      logoUrl: logoUrlOf({ id: p.id, logoMime, logoUpdatedAt }),
    }));
  }),

  /** Crée (sans id) ou modifie un partenaire. Le logo se gère à part (setLogo / clearLogo). */
  save: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).optional(),
        name: z.string().trim().min(1, "Le nom est obligatoire.").max(160),
        role: z.enum(["HOST", "FEDERATION", "OTHER"]),
        description: z.string().trim().max(300).nullish(),
        websiteUrl: z.union([z.literal(""), httpUrl]).nullish(),
        links: z
          .array(z.object({ label: z.string().trim().min(1, "Libellé du lien manquant.").max(120), url: httpUrl }))
          .max(10)
          .default([]),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
      const data = {
        name: input.name,
        role: input.role,
        description: input.description?.trim() || null,
        websiteUrl: input.websiteUrl?.trim() || null,
        links: input.links,
        isActive: input.isActive,
      };
      if (input.id) {
        const exists = await ctx.prisma.sitePartner.findUnique({ where: { id: input.id }, select: { id: true } });
        if (!exists) throw new TRPCError({ code: "NOT_FOUND", message: "Partenaire introuvable." });
        return ctx.prisma.sitePartner.update({ where: { id: input.id }, data, select: { id: true } });
      }
      const last = await ctx.prisma.sitePartner.aggregate({ _max: { position: true } });
      return ctx.prisma.sitePartner.create({ data: { ...data, position: (last._max.position ?? -1) + 1 }, select: { id: true } });
    }),

  /** Logo envoyé en base64 (SVG, PNG, WebP ou JPEG ≤ 512 Ko ; SVG sans contenu actif). */
  setLogo: protectedProcedure
    .input(z.object({ id: z.string().min(1), dataBase64: z.string().min(1), mimeType: z.enum(LOGO_MIME_TYPES) }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
      const buf = Buffer.from(input.dataBase64, "base64");
      validateLogo(buf, input.mimeType);
      const updated = await ctx.prisma.sitePartner.updateMany({
        where: { id: input.id },
        data: { logoData: buf, logoMime: input.mimeType, logoUpdatedAt: new Date() },
      });
      if (updated.count === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Partenaire introuvable." });
      return { success: true };
    }),

  clearLogo: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    await assertAdmin(ctx);
    await ctx.prisma.sitePartner.updateMany({
      where: { id: input.id },
      data: { logoData: null, logoMime: null, logoUpdatedAt: null },
    });
    return { success: true };
  }),

  delete: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    await assertAdmin(ctx);
    await ctx.prisma.sitePartner.deleteMany({ where: { id: input.id } });
    return { success: true };
  }),

  /** Nouvel ordre d'affichage : liste complète des identifiants, dans l'ordre voulu. */
  reorder: protectedProcedure.input(z.object({ ids: z.array(z.string().min(1)).min(1) })).mutation(async ({ ctx, input }) => {
    await assertAdmin(ctx);
    await ctx.prisma.$transaction(
      input.ids.map((id, position) => ctx.prisma.sitePartner.updateMany({ where: { id }, data: { position } })),
    );
    return { success: true };
  }),
});
