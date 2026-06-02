import { Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1 } from "@contracts/page";

/**
 * events/router.ts
 *
 * CRUD Event — événement ponctuel non récurrent, plus libre que Stage.
 *
 * Repas, conférence, journée portes ouvertes, atelier culturel, etc.
 * Ce qui distingue Event de Stage :
 *
 *   - **Pas obligatoirement rattaché** à une discipline (`disciplineId`
 *     nullable, comme Stage en v2) — un événement culturel large peut
 *     ne pas être rattaché à une discipline enseignée
 *   - **Un seul composite** Json (`content`) — pas la dichotomie
 *     description/program de Stage. Plus léger en structure
 *   - **`publicationDate?`** pour gérer brouillons (cohérent Post)
 *   - **Pattern animation simplifié** : un seul `organizerId`, pas de
 *     distinction primary/secondary, pas de relation many-to-many
 *
 * La date n'est pas portée par Event lui-même mais par ses
 * `EventSession[]` — comme Stage, un Event est un container temporel.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les events alimentent le site public).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_events"))`.
 *                  Permission dédiée — si elle n'existe pas encore dans
 *                  ton seed, à ajouter (cf. NOTES.md de cette livraison).
 *
 * ─── Sync transactionnelle des références médias ────────────────────────
 *
 * Le champ `content` accepte un `pageContentSchemaV1` typé, et toute
 * mutation qui le touche s'exécute dans une transaction qui appelle
 * `syncPageMediaReferences` avec `pageType: "EVENT"`. Si le composite
 * référence un mediaId non-published, la mutation roll-back avec un
 * BAD_REQUEST précis.
 *
 * ─── Validation « au moins un des trois » ───────────────────────────────
 *
 * Cohérent avec Stage v2 : au moins un de `disciplineId`,
 * `externalDisciplineLabel`, `originId` doit être renseigné pour qu'un
 * Event ait du contexte. Vérifié en Zod au create, en router après
 * merge à l'update.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

const audienceEnum = z.enum(["KIDS", "TEENAGERS", "ADULTS", "ALL_AGES"]);

const userIdSchema = z.string().trim().min(1);

const createInput = z
  .object({
    label: z.string().trim().min(1).max(255),
    content: pageContentSchemaV1,
    audience: audienceEnum,

    // Trois champs de rattachement, tous optionnels en Zod —
    // au moins un requis via `.refine` en bas.
    disciplineId: z.number().int().positive().nullable().optional(),
    externalDisciplineLabel: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .nullable()
      .optional(),
    originId: z.number().int().positive().nullable().optional(),

    organizerId: userIdSchema,
    publicationDate: z.coerce.date().nullable().optional(),
  })
  .refine(
    (data) =>
      (data.disciplineId !== null && data.disciplineId !== undefined) ||
      (data.externalDisciplineLabel !== null &&
        data.externalDisciplineLabel !== undefined) ||
      (data.originId !== null && data.originId !== undefined),
    {
      message:
        "At least one of disciplineId, externalDisciplineLabel, or originId must be provided.",
      path: ["disciplineId"],
    },
  );

const updateInput = z.object({
  id: z.number().int().positive(),
  label: z.string().trim().min(1).max(255).optional(),
  content: pageContentSchemaV1.optional(),
  audience: audienceEnum.optional(),

  // Validation « au moins un des trois » faite en router après merge
  // avec l'état actuel en DB (Zod ne connaît pas l'état actuel).
  disciplineId: z.number().int().positive().nullable().optional(),
  externalDisciplineLabel: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .nullable()
    .optional(),
  originId: z.number().int().positive().nullable().optional(),

  organizerId: userIdSchema.optional(),
  publicationDate: z.coerce.date().nullable().optional(),
});

/* -------------------------------------------------------------------------- */
/*                             INTERNAL HELPERS                               */
/* -------------------------------------------------------------------------- */

async function assertDisciplineExists(
  prisma: PrismaClient,
  disciplineId: number | null | undefined,
): Promise<void> {
  if (disciplineId === null || disciplineId === undefined) return;
  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
    select: { id: true },
  });
  if (!discipline) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Discipline not found (id=${disciplineId}).`,
    });
  }
}

async function assertOriginExists(
  prisma: PrismaClient,
  originId: number | null | undefined,
): Promise<void> {
  if (originId === null || originId === undefined) return;
  const origin = await prisma.origin.findUnique({
    where: { id: originId },
    select: { id: true },
  });
  if (!origin) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Origin not found (id=${originId}).`,
    });
  }
}

async function assertUserExists(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `User not found (id=${userId}).`,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const eventRouter = router({
  /**
   * Liste tous les events publiés (publicationDate non null et passé).
   * Pour l'admin, utiliser `getAllAdmin` qui inclut les brouillons.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      where: {
        publicationDate: { not: null, lte: new Date() },
      },
      orderBy: { publicationDate: "desc" },
    });
  }),

  /**
   * Liste tous les events sans filtre — incluant brouillons et programmés.
   * Réservé à l'admin (requirePermission).
   */
  getAllAdmin: protectedProcedure
    .use(requirePermission("manage_events"))
    .query(async ({ ctx }) => {
      return ctx.prisma.event.findMany({
        orderBy: [
          { publicationDate: { sort: "desc", nulls: "first" } },
          { createdAt: "desc" },
        ],
      });
    }),

  getAllByDiscipline: publicProcedure
    .input(z.object({ disciplineId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findMany({
        where: {
          disciplineId: input.disciplineId,
          publicationDate: { not: null, lte: new Date() },
        },
        orderBy: { publicationDate: "desc" },
      });
    }),

  getAllByOrigin: publicProcedure
    .input(z.object({ originId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findMany({
        where: {
          originId: input.originId,
          publicationDate: { not: null, lte: new Date() },
        },
        orderBy: { publicationDate: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        relationLoadStrategy: "join",
        include: {
          sessions: { orderBy: { date: "asc" } },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found.",
        });
      }

      return event;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_events"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // ─── Validations pré-transaction ───────────────────────────────────

      await assertDisciplineExists(ctx.prisma, input.disciplineId);
      await assertOriginExists(ctx.prisma, input.originId);
      await assertUserExists(ctx.prisma, input.organizerId);

      // ─── Transaction : create event + sync references ──────────────────

      return await ctx.prisma.$transaction(async (tx) => {
        const created = await tx.event.create({
          data: {
            label: input.label,
            content: input.content as Prisma.InputJsonValue,
            audience: input.audience,
            disciplineId: input.disciplineId ?? null,
            externalDisciplineLabel: input.externalDisciplineLabel ?? null,
            originId: input.originId ?? null,
            organizerId: input.organizerId,
            publicationDate: input.publicationDate ?? null,
          },
        });

        await syncPageMediaReferences(tx, {
          pageType: "EVENT",
          pageId: String(created.id),
          newContent: input.content,
        });

        return created;
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_events"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, content, ...rest } = input;

      // ─── Lecture pré-transaction (pour validation post-merge) ──────────

      const existing = await ctx.prisma.event.findUnique({
        where: { id },
        select: {
          disciplineId: true,
          externalDisciplineLabel: true,
          originId: true,
        },
      });
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found.",
        });
      }

      // Validation « au moins un des trois » après merge.
      const mergedDisciplineId =
        rest.disciplineId !== undefined
          ? rest.disciplineId
          : existing.disciplineId;
      const mergedExternalLabel =
        rest.externalDisciplineLabel !== undefined
          ? rest.externalDisciplineLabel
          : existing.externalDisciplineLabel;
      const mergedOriginId =
        rest.originId !== undefined ? rest.originId : existing.originId;

      const hasAtLeastOne =
        mergedDisciplineId !== null ||
        (mergedExternalLabel !== null && mergedExternalLabel.length > 0) ||
        mergedOriginId !== null;

      if (!hasAtLeastOne) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "An event must keep at least one of disciplineId, externalDisciplineLabel, or originId set.",
        });
      }

      // Validations existence si champs modifiés et non-null
      if (rest.disciplineId !== undefined && rest.disciplineId !== null) {
        await assertDisciplineExists(ctx.prisma, rest.disciplineId);
      }
      if (rest.originId !== undefined && rest.originId !== null) {
        await assertOriginExists(ctx.prisma, rest.originId);
      }
      if (rest.organizerId !== undefined) {
        await assertUserExists(ctx.prisma, rest.organizerId);
      }

      // ─── Transaction : update + sync conditionnel ──────────────────────

      return await ctx.prisma.$transaction(async (tx) => {
        let updated;
        try {
          const data: Prisma.EventUncheckedUpdateInput = {
            label: rest.label,
            audience: rest.audience,
            disciplineId: rest.disciplineId,
            externalDisciplineLabel: rest.externalDisciplineLabel,
            originId: rest.originId,
            organizerId: rest.organizerId,
            publicationDate: rest.publicationDate,
            content:
              content === undefined
                ? undefined
                : (content as Prisma.InputJsonValue),
          };

          updated = await tx.event.update({
            where: { id },
            data,
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Event not found.",
            });
          }
          throw err;
        }

        if (content !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "EVENT",
            pageId: String(id),
            newContent: content,
          });
        }

        return updated;
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_events"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Les EventSession liées seront supprimées en cascade
      // (onDelete: Cascade dans le schéma). Mais les `PageMediaReference`
      // n'ont pas de FK DB côté `pageId` — il faut les nettoyer
      // explicitement avant le delete.
      return await ctx.prisma.$transaction(async (tx) => {
        await syncPageMediaReferences(tx, {
          pageType: "EVENT",
          pageId: String(input.id),
          newContent: null,
        });

        try {
          return await tx.event.delete({
            where: { id: input.id },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Event not found.",
            });
          }
          throw err;
        }
      });
    }),
});

export default eventRouter;