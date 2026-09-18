import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import {
  putSiteLogo,
  SITE_LOGO_KEY,
} from "@backend/modules/siteSettings/services/siteLogo.service";

const SETTINGS_ID = "site";

/** Réserve l'action aux administrateurs (appartenance au groupe Administrateurs). */
async function assertAdmin(ctx: {
  prisma: PrismaClient;
  user: { id: string };
}): Promise<void> {
  if (!(await isAdminByGroup(ctx.prisma, ctx.user.id))) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Réservé aux administrateurs.",
    });
  }
}

/**
 * Réglages d'identité du site (singleton). Lecture PUBLIQUE (le header, l'onglet
 * et les e-mails les consomment, y compris pour les visiteurs anonymes) ;
 * écriture protégée — même statut que homeHero.save / sitePage.save (pas de
 * permission nommée).
 *
 * `shortTitle` est un LIBELLÉ, sans rapport avec `APP_SHORT_NAME` (racine de
 * stockage, qui reste dans le .env). `logoAssetId` référence un MediaAsset ;
 * chaîne vide traitée comme "pas de logo" (→ logo embarqué en repli).
 */
export const siteSettingsRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    if (!settings) return null;

    // URL publique du logo, résolue serveur (le Header client la consomme).
    // Pas de filtre `published` : le logo est public par désignation (garde 3a).
    let logoUrl: string | null = null;
    if (settings.logoKey) {
      // Logo R2 hors finder : servi par la route dédiée, invalidé par ?v=.
      const v = settings.updatedAt.getTime();
      logoUrl = `/api/media/site-logo?v=${v}`;
    } else if (settings.logoAssetId) {
      // Rétro-compat : ancien logo choisi au picker (MediaAsset).
      const asset = await ctx.prisma.mediaAsset.findUnique({
        where: { id: settings.logoAssetId },
        select: { publicId: true, fullPath: true },
      });
      if (asset) logoUrl = buildMediaProxyUrl(asset, "public");
    }

    return { ...settings, logoUrl };
  }),

  save: protectedProcedure
    .input(
      z.object({
        shortTitle: z.string().trim().min(1).max(60),
        longTitle: z.string().trim().min(1).max(160),
        tagline: z.string().trim().max(200).nullish(),
        supportEmail: z
          .union([z.literal(""), z.string().trim().email().max(160)])
          .nullish(),
        defaultLocale: z.string().trim().min(2).max(10),
        logoAssetId: z.string().trim().max(500).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
      const clean = (v: string | null | undefined): string | null =>
        v && v.trim() !== "" ? v.trim() : null;
      const data = {
        shortTitle: input.shortTitle,
        longTitle: input.longTitle,
        tagline: clean(input.tagline),
        supportEmail: clean(input.supportEmail),
        defaultLocale: input.defaultLocale,
        logoAssetId: clean(input.logoAssetId),
      };
      return ctx.prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID, ...data },
        update: data,
      });
    }),

  /**
   * Upload du logo du site (admin). SVG ≤ 512 Ko, envoyé en base64 (petit
   * fichier, pas de flux presign). Écrit R2 (system/logo.svg, hors finder) puis
   * mémorise logoKey. Le logo n'est JAMAIS un MediaAsset.
   */
  uploadLogo: protectedProcedure
    .input(
      z.object({
        dataBase64: z.string().min(1),
        mimeType: z.literal("image/svg+xml"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
      const buf = Buffer.from(input.dataBase64, "base64");
      if (buf.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier vide." });
      }
      if (buf.length > 512 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Logo trop volumineux (max 512 Ko).",
        });
      }
      await putSiteLogo(buf, input.mimeType);
      await ctx.prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID, logoKey: SITE_LOGO_KEY },
        update: { logoKey: SITE_LOGO_KEY },
      });
      return { success: true };
    }),
});
