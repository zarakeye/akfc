import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { IMAGE_USAGE_VALUES } from "@contracts/legal/imageConsent";
import {
  createImageConsentFormUpload,
  deleteImageConsentForm,
  imageConsentFormSelect,
  registerImageConsentForm,
} from "@backend/modules/imageConsent/imageConsentForm.service";
import { confirmMemberConsent, onlineConsentState } from "@backend/modules/imageConsent/imageConsentOnline.service";
import {
  confirmGuardianConsent,
  guardianRequestByToken,
  requestGuardianConsent,
  resendGuardianLink,
} from "@backend/modules/imageConsent/imageConsentGuardian.service";
import { byEffectiveDesc } from "@backend/modules/imageConsent/formOrder";

const adminProcedure = protectedProcedure.use(isAdmin);

/** Choix d'autorisation, tels que le formulaire en ligne les envoie. */
const choicesInput = z.object({
  usages: z.array(z.enum(IMAGE_USAGE_VALUES)),
  keepAfterLeave: z.boolean().nullable(),
});
/** Jeton du lien envoyé au parent (forme vérifiée par le service). */
const tokenInput = z.object({ token: z.string().min(1).max(100) });

/**
 * Droit à l'image : formulaires signés. Dépôt et suppression réservés aux admins ; le membre
 * consulte les siens (`mine`). Le fichier est servi par /api/media/image-consent/[id].
 */
export const imageConsentRouter = router({
  /** Envoi direct sur R2 : URL signée (PUT) + chemin à renvoyer à `register`. */
  createUpload: adminProcedure
    .input(z.object({ userId: z.string().min(1), mimeType: z.string().min(1), bytes: z.number().int().positive() }))
    .mutation(({ input }) => createImageConsentFormUpload(input)),

  /** Après l'envoi : enregistre le formulaire ; le statut change si ses droits sont les plus récents. */
  register: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        path: z.string().min(1),
        fileName: z.string().max(300),
        usages: z.array(z.enum(IMAGE_USAGE_VALUES)),
        keepAfterLeave: z.boolean().nullable(),
        signedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Midi UTC : le jour saisi reste le même jour dans tous les fuseaux d'Europe.
      const signedAt = input.signedAt ? new Date(`${input.signedAt}T12:00:00Z`) : null;
      if (signedAt && signedAt.getTime() > Date.now() + 24 * 3600 * 1000) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "La date de signature est dans le futur." });
      }
      return registerImageConsentForm({
        prisma: ctx.prisma,
        userId: input.userId,
        uploadedById: ctx.sessionClient.user.id,
        path: input.path,
        fileName: input.fileName,
        usages: input.usages,
        keepAfterLeave: input.keepAfterLeave,
        signedAt,
      });
    }),

  /** Formulaires d'un membre, du plus récent au plus ancien par date des droits (fiche admin). */
  listForUser: adminProcedure.input(z.object({ userId: z.string().min(1) })).query(async ({ ctx, input }) => {
    const forms = await ctx.prisma.imageConsentForm.findMany({
      where: { userId: input.userId },
      select: { ...imageConsentFormSelect, uploadedBy: { select: { firstName: true, lastName: true, email: true } } },
    });
    return forms.sort(byEffectiveDesc);
  }),

  remove: adminProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    await deleteImageConsentForm(ctx.prisma, input.id);
    return { ok: true };
  }),

  /** Profil : majorité, possibilité de confirmer en ligne, ce qui manque (mineur). */
  onlineState: protectedProcedure.query(({ ctx }) => onlineConsentState(ctx.prisma, ctx.sessionClient.user.id)),

  /** Membre majeur : confirme en ligne ses choix, avec son mot de passe. */
  confirmMine: protectedProcedure
    .input(
      z.object({
        usages: z.array(z.enum(IMAGE_USAGE_VALUES)),
        keepAfterLeave: z.boolean().nullable(),
        password: z.string().min(1, "Saisissez votre mot de passe."),
      }),
    )
    .mutation(({ ctx, input }) =>
      confirmMemberConsent({
        prisma: ctx.prisma,
        userId: ctx.sessionClient.user.id,
        password: input.password,
        usages: input.usages,
        keepAfterLeave: input.keepAfterLeave,
      }),
    ),

  /** Membre mineur : ses souhaits, et le lien envoyé à son parent référent (remplace le précédent). */
  requestGuardian: protectedProcedure
    .input(choicesInput)
    .mutation(({ ctx, input }) =>
      requestGuardianConsent({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, ...input }),
    ),

  /** Admin : renvoie le lien au parent d'un mineur (mêmes souhaits, nouveau lien). */
  resendGuardianForUser: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(({ ctx, input }) => resendGuardianLink(ctx.prisma, input.userId)),

  /** Page du parent (sans compte) : le formulaire pré-rempli des souhaits du membre. */
  guardianRequest: publicProcedure.input(tokenInput).query(({ ctx, input }) => guardianRequestByToken(ctx.prisma, input.token)),

  /** Le parent valide : il se déclare représentant légal ; ses choix font foi. */
  confirmGuardian: publicProcedure
    .input(tokenInput.merge(choicesInput).extend({ isLegalRepresentative: z.literal(true) }))
    .mutation(({ ctx, input }) =>
      confirmGuardianConsent({
        prisma: ctx.prisma,
        token: input.token,
        usages: input.usages,
        keepAfterLeave: input.keepAfterLeave,
      }),
    ),

  /** Statut et formulaires du membre connecté (profil). */
  mine: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const [user, forms] = await Promise.all([
      ctx.prisma.user.findUnique({ where: { id: userId }, select: { imageConsent: true, imageConsentAt: true } }),
      ctx.prisma.imageConsentForm.findMany({ where: { userId }, select: imageConsentFormSelect }),
    ]);
    return { consent: user?.imageConsent ?? "UNKNOWN", recordedAt: user?.imageConsentAt ?? null, forms: forms.sort(byEffectiveDesc) };
  }),
});

export default imageConsentRouter;
