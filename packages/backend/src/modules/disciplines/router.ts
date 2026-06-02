import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1 } from "@contracts/page";

/**
 * disciplines/router.ts
 *
 * CRUD Discipline (modèle 2-niveaux : Category → Discipline).
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les disciplines alimentent potentiellement
 *                  le site public, au même titre que les catégories).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_disciplines"))`.
 *
 * Règles métier :
 *   - `categoryId` N'EST PAS modifiable via `update`. Déplacer une discipline
 *     de catégorie briserait la cohérence des chemins Cloudinary existants
 *     (qui encodent `category.type` slugifié dans leurs segments).
 *   - `delete` est un hard delete : avant de supprimer, on vérifie qu'aucune
 *     dépendance ne subsiste (Course, Stage, Event, MediaAsset). Si oui,
 *     CONFLICT.
 *   - L'unicité `(categoryId, name)` est portée par le schéma Prisma ; une
 *     violation renvoie une erreur CONFLICT explicite.
 *
 * ─── Évolution v2 (migration domain_v2_expansion) ─────────────────────────
 *
 * Deux changements de schéma adressés ici :
 *
 *   1. `Discipline.origin` (String? libre) → `originId` (Int? FK vers Origin).
 *      L'input métier passe d'un texte libre à un id résolu depuis l'admin
 *      (sélecteur peuplé par `origin.getAll`). La validation côté router
 *      vérifie que l'origine référencée existe en DB.
 *
 *   2. `Discipline.description` (String?) → `description` (Json) — composite
 *      éditable au PageBuilder. Le champ accepte désormais un
 *      `pageContentSchemaV1`, et toute mutation qui le touche s'exécute
 *      dans une transaction qui appelle `syncPageMediaReferences` pour
 *      maintenir la table `PageMediaReference` à jour (pageType: "DISCIPLINE").
 *      Si le composite référence un mediaId non-published, la mutation
 *      roll-back avec un BAD_REQUEST précis.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

const disciplineTypeEnum = z.enum(["MARTIAL_ART", "CALLIGRAPHY"]);

const createInput = z.object({
  name: z.string().trim().min(1).max(120),
  type: disciplineTypeEnum,
  family: z.string().trim().min(1).max(120).nullable().optional(),
  school: z.string().trim().min(1).max(120).nullable().optional(),
  classification: z.string().trim().min(1).max(120).nullable().optional(),

  // ID de l'origine culturelle (relation vers le modèle Origin).
  // Nullable : une discipline peut ne pas avoir d'origine renseignée
  // (création progressive — on lie l'origine plus tard).
  originId: z.number().int().positive().nullable().optional(),

  // Composite Json du PageBuilder pour la page de présentation de la
  // discipline. Requis au create — le frontend envoie au minimum
  // `emptyPageContentV1()` si l'admin n'a rien rédigé.
  description: pageContentSchemaV1,

  categoryId: z.number().int().positive(),
  instructorId: z.string().trim().min(1),
});

const updateInput = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(120).optional(),
  type: disciplineTypeEnum.optional(),
  family: z.string().trim().min(1).max(120).nullable().optional(),
  school: z.string().trim().min(1).max(120).nullable().optional(),
  classification: z.string().trim().min(1).max(120).nullable().optional(),

  // originId nullable + optional : permet d'attacher, détacher, ou
  // ne pas toucher selon `undefined` vs `null` vs un id.
  originId: z.number().int().positive().nullable().optional(),

  // description optional : si non fourni, le composite reste tel qu'il
  // est en DB. Si fourni, la sync transactionnelle s'applique.
  description: pageContentSchemaV1.optional(),

  instructorId: z.string().trim().min(1).optional(),
  // Note : `categoryId` volontairement absent — non modifiable.
});

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const disciplineRouter = router({
  /**
   * Liste toutes les disciplines d'une catégorie donnée.
   * Usage typique : formulaire d'upload (sélecteur de discipline après choix
   * de catégorie).
   */
  getAllByCategory: publicProcedure
    .input(z.object({ categoryId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.discipline.findMany({
        where: { categoryId: input.categoryId },
        orderBy: { name: "asc" },
      });
    }),

  /**
   * Liste toutes les disciplines toutes catégories confondues.
   * Utile pour les vues d'administration synthétiques.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.discipline.findMany({
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const discipline = await ctx.prisma.discipline.findUnique({
        where: { id: input.id },
      });

      if (!discipline) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Discipline not found.",
        });
      }

      return discipline;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // ─── Validations pré-transaction (lectures simples) ────────────────

      const category = await ctx.prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });
      if (!category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Category not found (id=${input.categoryId}).`,
        });
      }

      const instructor = await ctx.prisma.user.findUnique({
        where: { id: input.instructorId },
        select: { id: true },
      });
      if (!instructor) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Instructor not found (id=${input.instructorId}).`,
        });
      }

      if (input.originId !== null && input.originId !== undefined) {
        const origin = await ctx.prisma.origin.findUnique({
          where: { id: input.originId },
          select: { id: true },
        });
        if (!origin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Origin not found (id=${input.originId}).`,
          });
        }
      }

      // ─── Transaction : create discipline + sync references ─────────────

      return await ctx.prisma.$transaction(async (tx) => {
        let created;
        try {
          created = await tx.discipline.create({
            data: {
              name: input.name,
              type: input.type,
              family: input.family ?? null,
              school: input.school ?? null,
              classification: input.classification ?? null,
              originId: input.originId ?? null,
              description: input.description as Prisma.InputJsonValue,
              categoryId: input.categoryId,
              instructorId: input.instructorId,
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "A discipline with this name already exists in this category.",
            });
          }
          throw err;
        }

        await syncPageMediaReferences(tx, {
          pageType: "DISCIPLINE",
          pageId: String(created.id),
          newContent: input.description,
        });

        return created;
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

      // ─── Validations pré-transaction ───────────────────────────────────

      if (rest.instructorId !== undefined) {
        const instructor = await ctx.prisma.user.findUnique({
          where: { id: rest.instructorId },
          select: { id: true },
        });
        if (!instructor) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Instructor not found (id=${rest.instructorId}).`,
          });
        }
      }

      // originId : on valide seulement si fourni ET non-null
      // (null = détachement explicite, autorisé).
      if (rest.originId !== undefined && rest.originId !== null) {
        const origin = await ctx.prisma.origin.findUnique({
          where: { id: rest.originId },
          select: { id: true },
        });
        if (!origin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Origin not found (id=${rest.originId}).`,
          });
        }
      }

      // ─── Transaction : update + sync references si description fournie ─

      return await ctx.prisma.$transaction(async (tx) => {
        let updated;
        try {
          const data: Prisma.DisciplineUncheckedUpdateInput = {
            name: rest.name,
            type: rest.type,
            family: rest.family,
            school: rest.school,
            classification: rest.classification,
            originId: rest.originId,
            instructorId: rest.instructorId,
            description:
              rest.description === undefined
                ? undefined
                : (rest.description as Prisma.InputJsonValue),
          };

          updated = await tx.discipline.update({
            where: { id },
            data, // description undefined → Prisma ne touche pas au champ
          });
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
              throw new TRPCError({
                code: "CONFLICT",
                message:
                  "A discipline with this name already exists in this category.",
              });
            }
            if (err.code === "P2025") {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Discipline not found.",
              });
            }
          }
          throw err;
        }

        // La sync n'est appelée que si l'update a effectivement touché à
        // la description. Si l'admin met juste à jour `name` ou `family`,
        // les références médias n'ont pas changé.
        if (rest.description !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "DISCIPLINE",
            pageId: String(id),
            newContent: rest.description,
          });
        }

        return updated;
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Pré-vérification des dépendances — on refuse plutôt que de cascader.
      // Étendue à Event (nouvelle entité v2) en plus de Course/Stage/MediaAsset.
      const [courseCount, stageCount, eventCount, mediaAssetCount] =
        await Promise.all([
          ctx.prisma.course.count({ where: { disciplineId: input.id } }),
          ctx.prisma.stage.count({ where: { disciplineId: input.id } }),
          ctx.prisma.event.count({ where: { disciplineId: input.id } }),
          ctx.prisma.mediaAsset.count({ where: { disciplineId: input.id } }),
        ]);

      const deps: string[] = [];
      if (courseCount > 0) deps.push(`${courseCount} course(s)`);
      if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
      if (eventCount > 0) deps.push(`${eventCount} event(s)`);
      if (mediaAssetCount > 0) deps.push(`${mediaAssetCount} media asset(s)`);

      if (deps.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Cannot delete discipline: ${deps.join(
            ", ",
          )} still reference it. Migrate or delete them first.`,
        });
      }

      // Transaction : nettoyage des PageMediaReference avant le delete
      // physique de la discipline. Cohérent avec le pattern courses :
      // on libère les références AVANT pour ne pas laisser de rows
      // orphelines (la table n'a pas de FK DB sur `pageId`).
      return await ctx.prisma.$transaction(async (tx) => {
        await syncPageMediaReferences(tx, {
          pageType: "DISCIPLINE",
          pageId: String(input.id),
          newContent: null,
        });

        try {
          return await tx.discipline.delete({
            where: { id: input.id },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Discipline not found.",
            });
          }
          throw err;
        }
      });
    }),
});

export default disciplineRouter;