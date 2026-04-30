import { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";

/**
 * stages/router.ts
 *
 * CRUD Stage — un événement ponctuel rattaché à une Discipline de catégorie
 * "Stage". Un Stage n'a pas de date/heure directes : ses dates concrètes
 * sont portées par `StageSession` (cf. router `stageSession`).
 *
 * Unicité : `(disciplineId, label)` — deux stages d'une même discipline ne
 * peuvent pas porter le même label, mais le même label peut être réutilisé
 * pour d'autres disciplines.
 *
 * Animateurs (ambiguïté 1-β validée) : `primaryAnimator` FAIT PARTIE de
 * `animators`. L'API expose deux champs distincts au create/update :
 *   - `primaryAnimatorId` : obligatoire, animateur principal
 *   - `coAnimatorIds[]`   : optionnel, les autres animateurs
 * Le serveur compose la liste complète `animators` = `[primary, ...co]`.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les stages alimentent le site public).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_stages"))`.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

const audienceEnum = z.enum(["KIDS", "TEENAGERS", "ADULTS", "ALL_AGES"]);

/**
 * Helpers hérités de l'ancien router — Prisma.Json ne tolère pas `null`/
 * `undefined` en champ NON NULL. On force le type d'input en
 * `Prisma.InputJsonValue` via un refine + transform.
 */
const prismaJsonNonNull = z
  .any()
  .refine((v) => v !== null && v !== undefined, {
    message: "JSON value cannot be null or undefined",
  })
  .transform((v) => v as Prisma.InputJsonValue);

const prismaJsonOptionalWithFallback = z
  .any()
  .optional()
  .transform((v) => (v ?? {}) as Prisma.InputJsonValue);

const userIdSchema = z.string().trim().min(1);

/**
 * `coAnimatorIds` doit :
 *   - ne pas contenir de doublons
 *   - ne pas contenir le `primaryAnimatorId` (déjà principal, pas co)
 * Ces deux règles sont appliquées au niveau de l'objet parent via `.refine`.
 */
const coAnimatorIdsSchema = z.array(userIdSchema).default([]);

const createInput = z
  .object({
    disciplineId: z.number().int().positive(),
    label: z.string().trim().min(1).max(255),
    audience: audienceEnum,
    description: prismaJsonOptionalWithFallback,
    program: prismaJsonNonNull,
    preRegistered: z.array(userIdSchema).default([]),
    primaryAnimatorId: userIdSchema,
    coAnimatorIds: coAnimatorIdsSchema,
  })
  .refine(
    (data) => !data.coAnimatorIds.includes(data.primaryAnimatorId),
    {
      message: "coAnimatorIds must not include primaryAnimatorId.",
      path: ["coAnimatorIds"],
    }
  )
  .refine(
    (data) => new Set(data.coAnimatorIds).size === data.coAnimatorIds.length,
    {
      message: "coAnimatorIds must not contain duplicates.",
      path: ["coAnimatorIds"],
    }
  );

const updateInput = z
  .object({
    id: z.number().int().positive(),
    label: z.string().trim().min(1).max(255).optional(),
    audience: audienceEnum.optional(),
    description: prismaJsonOptionalWithFallback,
    program: z
      .any()
      .optional()
      .transform((v) =>
        v === undefined ? undefined : (v as Prisma.InputJsonValue)
      ),
    preRegistered: z.array(userIdSchema).optional(),
    primaryAnimatorId: userIdSchema.optional(),
    coAnimatorIds: z.array(userIdSchema).optional(),
    // Note : `disciplineId` volontairement absent — non modifiable.
  })
  .refine(
    (data) => {
      // Si les deux champs sont fournis, on revalide la cohérence.
      if (
        data.primaryAnimatorId !== undefined &&
        data.coAnimatorIds !== undefined
      ) {
        return !data.coAnimatorIds.includes(data.primaryAnimatorId);
      }
      return true;
    },
    {
      message: "coAnimatorIds must not include primaryAnimatorId.",
      path: ["coAnimatorIds"],
    }
  )
  .refine(
    (data) =>
      data.coAnimatorIds === undefined ||
      new Set(data.coAnimatorIds).size === data.coAnimatorIds.length,
    {
      message: "coAnimatorIds must not contain duplicates.",
      path: ["coAnimatorIds"],
    }
  );

/* -------------------------------------------------------------------------- */
/*                             INTERNAL HELPERS                               */
/* -------------------------------------------------------------------------- */

async function assertUsersExist(
  prisma: PrismaClient,
  userIds: string[]
): Promise<void> {
  if (userIds.length === 0) return;

  const found = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });

  const foundIds = new Set(found.map((u) => u.id));
  const missing = userIds.filter((id) => !foundIds.has(id));

  if (missing.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `User(s) not found: ${missing.join(", ")}`,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const stageRouter = router({
  /**
   * Liste tous les stages, triés par discipline puis label.
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.stage.findMany({
      orderBy: [{ disciplineId: "asc" }, { label: "asc" }],
    });
  }),

  /**
   * Liste les stages d'une discipline donnée.
   */
  getAllByDiscipline: publicProcedure
    .input(z.object({ disciplineId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.stage.findMany({
        where: { disciplineId: input.disciplineId },
        orderBy: { label: "asc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const stage = await ctx.prisma.stage.findUnique({
        where: { id: input.id },
        include: {
          animators: { select: { id: true, firstName: true, lastName: true } },
          sessions: { orderBy: { date: "asc" } },
        },
      });

      if (!stage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stage not found.",
        });
      }

      return stage;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // Vérifie que la discipline existe ET qu'elle appartient à la catégorie "Stage".
      const discipline = await ctx.prisma.discipline.findUnique({
        where: { id: input.disciplineId },
        select: {
          id: true,
          category: { select: { type: true } },
        },
      });
      if (!discipline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Discipline not found (id=${input.disciplineId}).`,
        });
      }
      if (discipline.category.type !== "Stage") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Discipline ${input.disciplineId} is not in the "Stage" category.`,
        });
      }

      // Vérifie que tous les animateurs (primary + co) existent.
      const allAnimatorIds = [
        input.primaryAnimatorId,
        ...input.coAnimatorIds,
      ];
      await assertUsersExist(ctx.prisma, allAnimatorIds);

      try {
        return await ctx.prisma.stage.create({
          data: {
            disciplineId: input.disciplineId,
            label: input.label,
            audience: input.audience,
            description: input.description,
            program: input.program,
            preRegistered: input.preRegistered,
            primaryAnimatorId: input.primaryAnimatorId,
            // `animators` inclut le primaryAnimator (β)
            animators: {
              connect: allAnimatorIds.map((id) => ({ id })),
            },
          },
          include: {
            animators: {
              select: { id: true, firstName: true, lastName: true },
            },
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
              "A stage with this label already exists for this discipline.",
          });
        }
        throw err;
      }
    }),

  update: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, coAnimatorIds, primaryAnimatorId, program, ...rest } = input;

      // Si l'un des deux champs liés aux animateurs change, on doit
      // recalculer la liste complète. Sinon, on ne touche pas à la relation.
      const animatorsChanged =
        primaryAnimatorId !== undefined || coAnimatorIds !== undefined;

      let finalAnimatorIds: string[] | null = null;

      if (animatorsChanged) {
        const existing = await ctx.prisma.stage.findUnique({
          where: { id },
          select: {
            primaryAnimatorId: true,
            animators: { select: { id: true } },
          },
        });
        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Stage not found.",
          });
        }

        const newPrimary = primaryAnimatorId ?? existing.primaryAnimatorId;
        const existingCoIds = existing.animators
          .map((a) => a.id)
          .filter((aid) => aid !== existing.primaryAnimatorId);
        const newCo = coAnimatorIds ?? existingCoIds;

        if (newCo.includes(newPrimary)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "coAnimatorIds must not include the (new) primaryAnimatorId.",
          });
        }

        finalAnimatorIds = [newPrimary, ...newCo];
        await assertUsersExist(ctx.prisma, finalAnimatorIds);
      }

      try {
        return await ctx.prisma.stage.update({
          where: { id },
          data: {
            ...rest,
            ...(primaryAnimatorId !== undefined ? { primaryAnimatorId } : {}),
            ...(program !== undefined ? { program } : {}),
            ...(finalAnimatorIds
              ? {
                  animators: {
                    set: finalAnimatorIds.map((aid) => ({ id: aid })),
                  },
                }
              : {}),
          },
          include: {
            animators: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "A stage with this label already exists for this discipline.",
            });
          }
          if (err.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Stage not found.",
            });
          }
        }
        throw err;
      }
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Les StageSession liées seront supprimées en cascade (onDelete: Cascade).
      // Rien à pré-vérifier côté DB.
      try {
        return await ctx.prisma.stage.delete({
          where: { id: input.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Stage not found.",
          });
        }
        throw err;
      }
    }),
});

export default stageRouter;