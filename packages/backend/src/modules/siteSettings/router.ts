import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { saveSiteContactSchema } from "@contracts/siteContact/siteContact.schema";
import { compactId, saveLegalSettingsSchema } from "@contracts/legal/legalSettings.schema";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import {
  putSiteLogo,
  SITE_LOGO_KEY,
} from "@backend/modules/siteSettings/services/siteLogo.service";

const SETTINGS_ID = "site";

/**
 * Réglages d'identité du site (singleton). Lecture PUBLIQUE (le header, l'onglet
 * et les e-mails les consomment, y compris pour les visiteurs anonymes) ;
 * écriture réservée aux administrateurs (`.use(isAdmin)`).
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
        select: { fullPath: true },
      });
      if (asset) logoUrl = buildMediaProxyUrl(asset, "public");
    }

    return { ...settings, logoUrl };
  }),

  save: protectedProcedure
    .use(isAdmin)
    .input(
      z.object({
        shortTitle: z.string().trim().min(1).max(60),
        longTitle: z.string().trim().min(1).max(160),
        tagline: z.string().trim().max(200).nullish(),
        supportEmail: z
          .union([z.literal(""), z.string().trim().email().max(160)])
          .nullish(),
        /** Facultatif : la page Réglages ne l'expose plus (aucun code ne le lit). */
        defaultLocale: z.string().trim().min(2).max(10).optional(),
        logoAssetId: z.string().trim().max(500).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clean = (v: string | null | undefined): string | null =>
        v && v.trim() !== "" ? v.trim() : null;
      const data = {
        shortTitle: input.shortTitle,
        longTitle: input.longTitle,
        tagline: clean(input.tagline),
        supportEmail: clean(input.supportEmail),
        ...(input.defaultLocale ? { defaultLocale: input.defaultLocale } : {}),
        logoAssetId: clean(input.logoAssetId),
      };
      return ctx.prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID, ...data },
        update: data,
      });
    }),

  /**
   * Coordonnées publiques du club (admin) : e-mail, téléphones (appel / WhatsApp), adresse.
   * Affichées à tous sur « Nous contacter ». Champ vide → non affiché.
   */
  saveContact: protectedProcedure.use(isAdmin).input(saveSiteContactSchema).mutation(async ({ ctx, input }) => {
    const data = {
      contactEmail: input.contactEmail.trim().toLowerCase() || null,
      contactPhones: input.contactPhones,
      contactAddress: input.contactAddress.replace(/\r\n/g, "\n").trim() || null,
    };
    await ctx.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });
    return { ok: true };
  }),

  /**
   * Informations légales (admin) : éditeur, directeur de la publication, hébergeur, durées de
   * conservation. Alimentent les pages légales générées et le registre des traitements.
   */
  saveLegal: protectedProcedure.use(isAdmin).input(saveLegalSettingsSchema).mutation(async ({ ctx, input }) => {
    const opt = (v: string): string | null => (v.trim() === "" ? null : v.trim());
    const data = {
      legalName: opt(input.legalName),
      legalRna: input.legalRna.trim() ? compactId(input.legalRna) : null,
      legalSiret: input.legalSiret.trim() ? compactId(input.legalSiret) : null,
      legalAddress: opt(input.legalAddress),
      legalPhone: opt(input.legalPhone),
      legalEmail: opt(input.legalEmail),
      publicationDirector: opt(input.publicationDirector),
      publicationDirectorTitle: opt(input.publicationDirectorTitle),
      hostName: opt(input.hostName),
      hostAddress: opt(input.hostAddress),
      hostPhone: opt(input.hostPhone),
      hostUrl: opt(input.hostUrl),
      storageRegion: input.storageRegion || null,
      credits: opt(input.credits),
      accountRetentionMonths: input.accountRetentionMonths,
      ticketRetentionMonths: input.ticketRetentionMonths,
      backupRetentionDays: input.backupRetentionDays,
      legalUpdatedAt: new Date(),
    };
    await ctx.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });
    return { ok: true };
  }),

  /**
   * Upload du logo du site (admin). SVG ≤ 512 Ko, envoyé en base64 (petit
   * fichier, pas de flux presign). Écrit R2 (system/logo.svg, hors finder) puis
   * mémorise logoKey. Le logo n'est JAMAIS un MediaAsset.
   */
  uploadLogo: protectedProcedure
    .use(isAdmin)
    .input(
      z.object({
        dataBase64: z.string().min(1),
        mimeType: z.literal("image/svg+xml"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

  /**
   * Rétablit le logo embarqué : efface la clé R2 (l'objet system/logo.svg reste
   * mais n'est plus référencé — écrasé au prochain upload). Le consommateur
   * retombe alors sur le SVG embarqué.
   */
  clearLogo: protectedProcedure.use(isAdmin).mutation(async ({ ctx }) => {
    await ctx.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: { logoKey: null },
    });
    return { success: true };
  }),
});
