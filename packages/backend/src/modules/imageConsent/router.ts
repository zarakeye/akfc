import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "#trpc/core.ts";
import { isAdmin } from "#trpc/middleware.ts";
import {
  confirmBirthDateSchema,
  confirmGuardianSchema,
  confirmMineSchema,
  guardianTokenSchema,
  requestGuardianSchema,
} from "@akfc/contracts/legal/imageConsentForms.schema.ts";
import {
  deleteImageConsentForm,
  imageConsentFormSelect,
} from "#modules/imageConsent/imageConsentForm.service.ts";
import { confirmMemberConsent, onlineConsentState } from "#modules/imageConsent/imageConsentOnline.service.ts";
import {
  confirmGuardianConsent,
  guardianRequestByToken,
  pendingGuardianRequest,
  requestGuardianConsent,
  resendGuardianLink,
} from "#modules/imageConsent/imageConsentGuardian.service.ts";
import { byEffectiveDesc } from "#modules/imageConsent/formOrder.ts";
import {
  birthDateRequestByToken,
  confirmBirthDateByGuardian,
  pendingBirthDateRequest,
  requestBirthDateFromGuardian,
} from "#modules/users/birthDateRequest.service.ts";

const adminProcedure = protectedProcedure.use(isAdmin);

// Les schémas des formulaires viennent de contracts : les server actions et les formulaires
// appliquent les mêmes. Les procédures restent pour les tests et la future application mobile.
/** Jeton du lien envoyé au parent (forme vérifiée par le service). */
const tokenInput = z.object({ token: guardianTokenSchema });

/**
 * Droit à l'image : tout se fait en ligne (le membre majeur confirme, le parent d'un mineur valide).
 * Les admins consultent et suppriment les formulaires ; le membre consulte les siens (`mine`). Le fichier est servi par /api/media/image-consent/[id].
 */
export const imageConsentRouter = router({
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
    .input(confirmMineSchema)
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
    .input(requestGuardianSchema)
    .mutation(({ ctx, input }) =>
      requestGuardianConsent({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, ...input }),
    ),

  /** Admin : la demande en cours d'un mineur (souhaits, lien envoyé, validité), ou null. */
  guardianPendingForUser: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(({ ctx, input }) => pendingGuardianRequest(ctx.prisma, input.userId)),

  /** Admin : renvoie le lien au parent d'un mineur (mêmes souhaits, nouveau lien). */
  resendGuardianForUser: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(({ ctx, input }) => resendGuardianLink(ctx.prisma, input.userId)),

  /** Page du parent (sans compte) : les souhaits du membre, pré-cochés, et sa date de naissance. */
  guardianRequest: publicProcedure.input(tokenInput).query(({ ctx, input }) => guardianRequestByToken(ctx.prisma, input.token)),

  /** Le parent valide : il se déclare représentant légal ; ses choix font foi. */
  confirmGuardian: publicProcedure
    .input(confirmGuardianSchema)
    .mutation(({ ctx, input }) =>
      confirmGuardianConsent({
        prisma: ctx.prisma,
        token: input.token,
        usages: input.usages,
        keepAfterLeave: input.keepAfterLeave,
        birthDate: input.birthDate ?? null,
        confirmAdult: input.confirmAdult,
      }),
    ),

  /** Membre mineur : demande à son parent de renseigner, corriger ou effacer sa date de naissance. */
  requestBirthDate: protectedProcedure.mutation(({ ctx }) => requestBirthDateFromGuardian(ctx.prisma, ctx.sessionClient.user.id)),

  /** Membre mineur : sa demande de date en cours (adresse masquée), ou null. */
  birthDateRequestMine: protectedProcedure.query(({ ctx }) => pendingBirthDateRequest(ctx.prisma, ctx.sessionClient.user.id)),

  /** Page du parent (sans compte) : la date enregistrée, à confirmer, corriger ou effacer. */
  birthDateRequest: publicProcedure.input(tokenInput).query(({ ctx, input }) => birthDateRequestByToken(ctx.prisma, input.token)),

  /** Le parent valide la date (null : l'efface) ; il se déclare représentant légal. */
  confirmBirthDate: publicProcedure
    .input(confirmBirthDateSchema)
    .mutation(({ ctx, input }) =>
      confirmBirthDateByGuardian({
        prisma: ctx.prisma,
        token: input.token,
        birthDate: input.birthDate,
        confirmAdult: input.confirmAdult,
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
