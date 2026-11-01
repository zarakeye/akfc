import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

/**
 * origins/router.ts
 *
 * CRUD Origin — racine culturelle d'une discipline, d'un stage ou
 * d'un événement (« Japon », « Okinawa », « Chine », « Philippines »).
 *
 * Introduit par la migration v2 pour remplacer l'ancien champ
 * `Discipline.origin: String?` libre. Une entité dédiée permet de :
 *   - Éliminer les doublons orthographiques (contrainte `@unique` sur
 *     `name` et `slug`)
 *   - Ajouter des métadonnées culturelles riches (région, période
 *     historique, drapeau)
 *   - Regrouper transversalement disciplines / stages / events
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les origines alimentent le site
 *                  public, comme les disciplines).
 *   - Écritures  : `protectedProcedure.use(isAdmin)`.
 *                  Pas de permission dédiée pour la v1 — les origines
 *                  sont logiquement liées au domaine de gestion des
 *                  disciplines. À séparer en `manage_origins` si besoin.
 *
 * Règles métier :
 *   - `delete` est un hard delete : avant suppression, vérification qu'aucune
 *     dépendance ne subsiste (Discipline, Stage, Event). Si oui, CONFLICT.
 *   - L'unicité `(name)` et `(slug)` est portée par le schéma. Une violation
 *     renvoie CONFLICT avec un message précisant le champ fautif.
 *
 * Pas de PageBuilder ici : `description` reste un `String?` simple.
 * Si on veut une page riche par origine plus tard, on migrera ce champ
 * en `Json` (comme on l'a fait pour Discipline).
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                          INTERNAL ERROR MAPPING                            */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const originRouter = router({
  /**
   * Liste toutes les origines, triées par sortOrder puis name.
   * Sert à peupler les sélecteurs dans les forms admin (DisciplineForm,
   * StageForm, EventForm) et la future page publique `/origines`.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.origin.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const origin = await ctx.prisma.origin.findUnique({
        where: { id: input.id },
      });

      if (!origin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Origine introuvable.",
        });
      }

      return origin;
    }),

  delete: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Pré-vérification des dépendances — on refuse plutôt que de
      // cascader. Une origine référencée par une discipline, un stage
      // ou un event ne peut pas être supprimée sans détacher d'abord
      // ces entités.
      const [disciplineCount, stageCount, eventCount] = await Promise.all([
        ctx.prisma.discipline.count({ where: { originId: input.id } }),
        ctx.prisma.seminar.count({ where: { originId: input.id } }),
        ctx.prisma.event.count({ where: { originId: input.id } }),
      ]);

      const deps: string[] = [];
      if (disciplineCount > 0) deps.push(`${disciplineCount} discipline(s)`);
      if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
      if (eventCount > 0) deps.push(`${eventCount} événement(s)`);

      if (deps.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Impossible de supprimer l’origine : ${deps.join(
            ", ",
          )} y sont encore rattachés. Détachez-les d’abord.`,
        });
      }

      try {
        return await ctx.prisma.origin.delete({
          where: { id: input.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Origine introuvable.",
          });
        }
        throw err;
      }
    }),
});

export default originRouter;