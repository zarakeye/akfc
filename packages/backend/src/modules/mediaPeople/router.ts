import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import {
  mediaPeopleFor,
  mediaVerdictsFor,
  remindImageConsent,
  setMediaPeople,
  setNoRecognizablePerson,
  tagCandidates,
} from "@backend/modules/mediaPeople/mediaPeople.service";
import { publicRightsReport } from "@backend/modules/mediaPeople/publicRightsReport.service";

/**
 * Tags de personnes sur les médias : réservés aux administrateurs. Les tags sont des données
 * personnelles (qui apparaît sur quelle photo) : aucune procédure publique ne les expose.
 */
const adminProcedure = protectedProcedure.use(isAdmin);
const mediaInput = z.object({ mediaAssetId: z.string().min(1) });

export const mediaPeopleRouter = router({
  /** Un média : personnes taguées, état de chacune par usage, verdict. */
  forMedia: adminProcedure.input(mediaInput).query(({ ctx, input }) => mediaPeopleFor(ctx.prisma, input.mediaAssetId)),

  /** Membres à cocher dans la modale, avec l'état de leur droit à l'image. */
  candidates: adminProcedure.query(({ ctx }) => tagCandidates(ctx.prisma)),

  /** Remplace la liste des personnes taguées (cases cochées dans la modale). */
  setTags: adminProcedure
    .input(mediaInput.extend({ userIds: z.array(z.string().min(1)).max(200) }))
    .mutation(({ ctx, input }) =>
      setMediaPeople(ctx.prisma, { mediaAssetId: input.mediaAssetId, userIds: input.userIds, adminId: ctx.sessionClient.user.id }),
    ),

  /** « Aucune personne reconnaissable » (salle, matériel, de dos). */
  setNoRecognizable: adminProcedure
    .input(mediaInput.extend({ value: z.boolean() }))
    .mutation(({ ctx, input }) => setNoRecognizablePerson(ctx.prisma, input.mediaAssetId, input.value)),

  /** Verdicts de plusieurs médias (tableau d'une galerie, du carrousel, d'un bloc de page). */
  verdicts: adminProcedure
    .input(z.object({ mediaAssetIds: z.array(z.string().min(1)).max(500) }))
    .query(({ ctx, input }) => mediaVerdictsFor(ctx.prisma, input.mediaAssetIds)),

  /** Médias montrés sur le site public dont le droit à l'image demande une action (masqués, en attente, à taguer). */
  publicReport: adminProcedure.query(({ ctx }) => publicRightsReport(ctx.prisma)),

  /** Relance le droit à l'image d'une personne taguée (une fois au plus tous les 7 jours). */
  remind: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(({ ctx, input }) => remindImageConsent(ctx.prisma, input.userId)),
});
