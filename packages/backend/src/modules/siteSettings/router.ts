import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";

const SETTINGS_ID = "site";

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
  get: publicProcedure.query(({ ctx }) =>
    ctx.prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } }),
  ),

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
    .mutation(({ ctx, input }) => {
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
});
