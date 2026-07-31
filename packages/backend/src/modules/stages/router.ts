import { Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1, parsePageContentV1 } from "@contracts/page";
import { slugSchema } from "@contracts/slug/slug.schema";

/**
 * stages/router.ts
 *
 * CRUD Stage — un événement ponctuel. Un Stage n'a pas de date/heure
 * directes : ses dates concrètes sont portées par `StageSession`
 * (cf. router `stageSession`).
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
 *
 * ─── Évolution v2 (migration domain_v2_expansion) ─────────────────────────
 *
 * Trois changements de schéma adressés ici :
 *
 *   1. `Stage.disciplineId` est passé de `Int` à `Int?`. Un Stage peut
 *      désormais ne PAS être rattaché à une discipline enseignée — typique
 *      d'un intervenant externe sur une discipline non enregistrée
 *      (« Calligraphie chinoise », par exemple).
 *
 *   2. Deux nouveaux champs accompagnent le découplage :
 *      - `externalDisciplineLabel: String?` — pour nommer la discipline
 *        externe quand `disciplineId` est null
 *      - `originId: Int?` — pour rattacher à une culture (Origin) quand
 *        ni la discipline du club ni un label externe ne suffisent
 *
 *   3. **Au moins un des trois** (`disciplineId`, `externalDisciplineLabel`,
 *      `originId`) doit être renseigné pour qu'un Stage ait du contexte.
 *      Vérifié en Zod au create, et en router après merge pour l'update.
 *
 * Et migration des composites Json vers `pageContentSchemaV1` typé,
 * comme on l'a fait pour Course (sous-chantier 4) et Discipline
 * (livraison 1). Le Stage porte **deux composites séparés** —
 * `description` et `program` — qui ont donc deux syncs distinctes,
 * avec leurs `pageType` respectifs : `STAGE_DESCRIPTION` et `STAGE_PROGRAM`.
 *
 * ─── Garde métier sur la catégorie de discipline ────────────────────────
 *
 * Conservée mais désormais **conditionnelle** : si `disciplineId` est
 * fourni, on vérifie que la discipline appartient à la catégorie « Stage ».
 * Si null (stage externe), pas de vérification — la catégorie n'a pas
 * de sens dans ce cas.
 *
 * ─── Évolution navigation (socle slugs) ───────────────────────────────────
 *
 * Ajout d'un `slug String @unique` saisi par l'admin (pré-rempli via
 * `slugify` côté front, validé par `slugSchema`, stable au renommage) et
 * d'un `getBySlug` public pour la page détail `/stages/[slug]`. Le slug
 * étant une 2ᵉ contrainte d'unicité (en plus de `(disciplineId, label)`),
 * les `catch` P2002 distinguent le conflit de slug du conflit de label
 * via `err.meta.target`.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

const audienceEnum = z.enum(["KIDS", "TEENAGERS", "ADULTS", "ALL_AGES"]);

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
    // Trois champs de rattachement, tous optionnels en Zod —
    // au moins un requis via `.refine` en bas du schema.
    disciplineId: z.number().int().positive().nullable().optional(),
    externalDisciplineLabel: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .nullable()
      .optional(),
    originId: z.number().int().positive().nullable().optional(),

    label: z.string().trim().min(1).max(255),
    slug: slugSchema,
    audience: audienceEnum,

    // Composites Json typés au PageBuilder. Requis au create — le
    // frontend envoie `emptyPageContentV1()` au minimum.
    description: pageContentSchemaV1,
    program: pageContentSchemaV1,
    // Résumé pour la carte d'agenda. Optionnel : la colonne a un composite
    // vide par défaut, et un formulaire qui ne le renseigne pas doit
    // continuer de fonctionner.
    summary: pageContentSchemaV1.optional(),
    summaryMediaId: z.string().min(1).nullable().optional(),

    preRegistered: z.array(userIdSchema).default([]),
    primaryAnimatorId: userIdSchema,
    coAnimatorIds: coAnimatorIdsSchema,
    // Date de publication éditoriale. null/absent = brouillon (non visible
    // publiquement). Une date = publié/programmé. Cohérent avec Post/Event.
    publicationDate: z.coerce.date().nullable().optional(),
  })
  .refine(
    (data) => !data.coAnimatorIds.includes(data.primaryAnimatorId),
    {
      message: "coAnimatorIds must not include primaryAnimatorId.",
      path: ["coAnimatorIds"],
    },
  )
  .refine(
    (data) => new Set(data.coAnimatorIds).size === data.coAnimatorIds.length,
    {
      message: "coAnimatorIds must not contain duplicates.",
      path: ["coAnimatorIds"],
    },
  )
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

const updateInput = z
  .object({
    id: z.number().int().positive(),

    // Les trois champs de rattachement deviennent modifiables (cf. v2).
    // Validation « au moins un des trois » faite en router après merge
    // avec l'état actuel en DB, parce que Zod ne peut pas le savoir seul.
    disciplineId: z.number().int().positive().nullable().optional(),
    externalDisciplineLabel: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .nullable()
      .optional(),
    originId: z.number().int().positive().nullable().optional(),

    label: z.string().trim().min(1).max(255).optional(),
    slug: slugSchema.optional(),
    audience: audienceEnum.optional(),

    description: pageContentSchemaV1.optional(),
    program: pageContentSchemaV1.optional(),
    summary: pageContentSchemaV1.optional(),
    summaryMediaId: z.string().min(1).nullable().optional(),

    preRegistered: z.array(userIdSchema).optional(),
    primaryAnimatorId: userIdSchema.optional(),
    coAnimatorIds: z.array(userIdSchema).optional(),
    publicationDate: z.coerce.date().nullable().optional(),
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
    },
  )
  .refine(
    (data) =>
      data.coAnimatorIds === undefined ||
      new Set(data.coAnimatorIds).size === data.coAnimatorIds.length,
    {
      message: "coAnimatorIds must not contain duplicates.",
      path: ["coAnimatorIds"],
    },
  );

/* -------------------------------------------------------------------------- */
/*                             INTERNAL HELPERS                               */
/* -------------------------------------------------------------------------- */

async function assertUsersExist(
  prisma: PrismaClient,
  userIds: string[],
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

/**
 * Si `disciplineId` est fourni, vérifie qu'elle existe. Tolère
 * null/undefined (stage externe : rattachement par label ou origine).
 *
 * Note : contrairement à une version antérieure, on ne contraint PLUS la
 * catégorie de la discipline. Un stage peut porter sur n'importe quelle
 * discipline du club, comme le fait déjà Event. La catégorie sert au
 * rangement (médias, listing), pas à restreindre les rattachements.
 */
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

/* -------------------------------------------------------------------------- */
/*                                  ROUTER                                    */
/* -------------------------------------------------------------------------- */

export const stageRouter = router({
  /**
   * Liste publique des stages PUBLIÉS (publicationDate non null et passée).
   * L'admin utilise `getAllAdmin` (inclut brouillons et programmés).
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.stage.findMany({
      where: { publicationDate: { not: null, lte: new Date() } },
      orderBy: [{ disciplineId: "asc" }, { label: "asc" }],
    });
  }),

  /**
   * Liste admin de TOUS les stages — brouillons et programmés inclus.
   * Tri : programmés/brouillons d'abord (nulls first), puis par création.
   */
  getAllAdmin: protectedProcedure
    .use(requirePermission("manage_stages"))
    .query(async ({ ctx }) => {
      return ctx.prisma.stage.findMany({
        orderBy: [
          { publicationDate: { sort: "desc", nulls: "first" } },
          { createdAt: "desc" },
        ],
      });
    }),

  /**
   * Liste publique des stages PUBLIÉS d'une discipline donnée.
   */
  getAllByDiscipline: publicProcedure
    .input(z.object({ disciplineId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.stage.findMany({
        where: {
          disciplineId: input.disciplineId,
          publicationDate: { not: null, lte: new Date() },
        },
        orderBy: { label: "asc" },
      });
    }),

  /**
   * Lookup admin par id — brouillons/programmés inclus.
   * Alimente la page d'édition `/dashboard/stages/[id]/edit`.
   */
  getByIdAdmin: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const stage = await ctx.prisma.stage.findUnique({
        where: { id: input.id },
        relationLoadStrategy: "join",
        include: {
          animators: { select: { id: true, firstName: true, lastName: true } },
          sessions: { orderBy: { date: "asc" } },
        },
      });
      if (!stage) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Stage not found." });
      }
      return stage;
    }),

  /**
   * Lookup public par slug — alimente `/stages/[slug]`.
   * Seuls les stages PUBLIÉS sont visibles ; un brouillon/programmé
   * renvoie NOT_FOUND (on ne révèle pas son existence publiquement).
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ ctx, input }) => {
      const stage = await ctx.prisma.stage.findFirst({
        where: {
          slug: input.slug,
          publicationDate: { not: null, lte: new Date() },
        },
        relationLoadStrategy: "join",
        include: {
          animators: { select: { id: true, firstName: true, lastName: true } },
          sessions: { orderBy: { date: "asc" } },
        },
      });
      if (!stage) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Stage not found." });
      }
      return stage;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // ─── Validations pré-transaction ───────────────────────────────────

      await assertDisciplineExists(ctx.prisma, input.disciplineId);
      await assertOriginExists(ctx.prisma, input.originId);

      const allAnimatorIds = [
        input.primaryAnimatorId,
        ...input.coAnimatorIds,
      ];
      await assertUsersExist(ctx.prisma, allAnimatorIds);

      // ─── Transaction : create stage + sync DEUX composites ─────────────

      return await ctx.prisma.$transaction(async (tx) => {
        let created;
        try {
          created = await tx.stage.create({
            data: {
              disciplineId: input.disciplineId ?? null,
              externalDisciplineLabel: input.externalDisciplineLabel ?? null,
              originId: input.originId ?? null,
              label: input.label,
              slug: input.slug,
              audience: input.audience,
              description: input.description as Prisma.InputJsonValue,
              program: input.program as Prisma.InputJsonValue,
              summary:
                input.summary === undefined
                  ? undefined
                  : (input.summary as Prisma.InputJsonValue),
              summaryMediaId: input.summaryMediaId ?? null,
              preRegistered: input.preRegistered,
              primaryAnimatorId: input.primaryAnimatorId,
              // `animators` inclut le primaryAnimator (β)
              animators: {
                connect: allAnimatorIds.map((id) => ({ id })),
              },
              publicationDate: input.publicationDate ?? null,
            },
            relationLoadStrategy: "join",
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
            const t = err.meta?.target;
            const onSlug = Array.isArray(t)
              ? t.includes("slug")
              : String(t ?? "").includes("slug");
            throw new TRPCError({
              code: "CONFLICT",
              message: onSlug
                ? "This slug is already used. Choose a different one."
                : "A stage with this label already exists for this discipline.",
            });
          }
          throw err;
        }

        // Deux syncs séparées : description et program portent chacun
        // leur propre composite, donc leurs propres références médias.
        // Cohérent avec le `PageReferencerKind` enum qui les distingue.
        await syncPageMediaReferences(tx, {
          pageType: "STAGE_DESCRIPTION",
          pageId: String(created.id),
          newContent: input.description,
        });
        await syncPageMediaReferences(tx, {
          pageType: "STAGE_PROGRAM",
          pageId: String(created.id),
          newContent: input.program,
        });
        // Le résumé porte ses propres références, image de carte comprise :
        // celle-ci vit hors composite et échapperait au recensement sans
        // `extraMediaIds`.
        await syncPageMediaReferences(tx, {
          pageType: "STAGE_SUMMARY",
          pageId: String(created.id),
          newContent: input.summary ?? { version: 1, blocks: [] },
          extraMediaIds: input.summaryMediaId ? [input.summaryMediaId] : [],
        });

        return created;
      });
    }),

  update: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        coAnimatorIds,
        primaryAnimatorId,
        description,
        program,
        summary,
        ...rest
      } = input;

      // ─── Lecture de l'état actuel (validation post-merge) ──────────────
      //
      // On a besoin de l'état actuel pour deux raisons :
      //   1. Animateurs : si l'un des deux champs change, on recalcule
      //      la liste complète à partir de l'existant
      //   2. Validation « au moins un des trois » : on vérifie que la
      //      combinaison après merge satisfait toujours la règle

      const existing = await ctx.prisma.stage.findUnique({
        where: { id },
        select: {
          disciplineId: true,
          externalDisciplineLabel: true,
          originId: true,
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

      // Validation « au moins un des trois » après merge.
      // `rest.disciplineId !== undefined` signifie que le champ est dans
      // le payload — soit avec un id, soit avec `null` (détachement).
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
            "A stage must keep at least one of disciplineId, externalDisciplineLabel, or originId set.",
        });
      }

      // Validation discipline si modifiée et non-null
      if (rest.disciplineId !== undefined && rest.disciplineId !== null) {
        await assertDisciplineExists(ctx.prisma, rest.disciplineId);
      }

      // Validation origine si modifiée et non-null
      if (rest.originId !== undefined && rest.originId !== null) {
        await assertOriginExists(ctx.prisma, rest.originId);
      }

      // ─── Recalcul de la liste des animateurs si nécessaire ─────────────

      const animatorsChanged =
        primaryAnimatorId !== undefined || coAnimatorIds !== undefined;

      let finalAnimatorIds: string[] | null = null;

      if (animatorsChanged) {
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

      // ─── Transaction : update + syncs conditionnels ────────────────────

      return await ctx.prisma.$transaction(async (tx) => {
        let updated;
        try {
          const data: Prisma.StageUncheckedUpdateInput = {
            disciplineId: rest.disciplineId,
            externalDisciplineLabel: rest.externalDisciplineLabel,
            originId: rest.originId,
            label: rest.label,
            slug: rest.slug,
            audience: rest.audience,
            preRegistered: rest.preRegistered,
            publicationDate: rest.publicationDate,
            description:
              description === undefined
                ? undefined
                : (description as Prisma.InputJsonValue),
            program:
              program === undefined
                ? undefined
                : (program as Prisma.InputJsonValue),
            summary:
              summary === undefined
                ? undefined
                : (summary as Prisma.InputJsonValue),
            summaryMediaId: rest.summaryMediaId,
            ...(primaryAnimatorId !== undefined ? { primaryAnimatorId } : {}),
            ...(finalAnimatorIds
              ? {
                  animators: {
                    set: finalAnimatorIds.map((aid) => ({ id: aid })),
                  },
                }
              : {}),
          };

          updated = await tx.stage.update({
            where: { id },
            data,
            relationLoadStrategy: "join",
            include: {
              animators: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          });
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
              const t = err.meta?.target;
              const onSlug = Array.isArray(t)
                ? t.includes("slug")
                : String(t ?? "").includes("slug");
              throw new TRPCError({
                code: "CONFLICT",
                message: onSlug
                  ? "This slug is already used. Choose a different one."
                  : "A stage with this label already exists for this discipline.",
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

        // Syncs conditionnels — chaque composite indépendamment.
        if (description !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "STAGE_DESCRIPTION",
            pageId: String(id),
            newContent: description,
          });
        }
        if (program !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "STAGE_PROGRAM",
            pageId: String(id),
            newContent: program,
          });
        }
        // Relecture APRÈS écriture plutôt que raisonnement sur ce qui a été
        // fourni : composite et image se modifient séparément, et traiter
        // l'un sans l'autre laisserait la référence de l'autre à l'abandon.
        if (summary !== undefined || rest.summaryMediaId !== undefined) {
          const row = await tx.stage.findUnique({
            where: { id },
            select: { summary: true, summaryMediaId: true },
          });
          await syncPageMediaReferences(tx, {
            pageType: "STAGE_SUMMARY",
            pageId: String(id),
            newContent: parsePageContentV1(row?.summary),
            extraMediaIds: row?.summaryMediaId ? [row.summaryMediaId] : [],
          });
        }

        return updated;
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_stages"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Les StageSession liées seront supprimées en cascade
      // (onDelete: Cascade dans le schéma). Mais les `PageMediaReference`
      // n'ont pas de FK DB côté `pageId` — il faut les nettoyer
      // explicitement avant le delete.
      return await ctx.prisma.$transaction(async (tx) => {
        // Sync des deux composites : libération de toutes les références
        // médias de ce stage. `newContent: null` = mode delete du helper.
        await syncPageMediaReferences(tx, {
          pageType: "STAGE_DESCRIPTION",
          pageId: String(input.id),
          newContent: null,
        });
        await syncPageMediaReferences(tx, {
          pageType: "STAGE_PROGRAM",
          pageId: String(input.id),
          newContent: null,
        });
        await syncPageMediaReferences(tx, {
          pageType: "STAGE_SUMMARY",
          pageId: String(input.id),
          newContent: null,
        });

        try {
          return await tx.stage.delete({
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
      });
    }),
});

export default stageRouter;