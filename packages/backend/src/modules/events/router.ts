import { Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1 } from "@contracts/page";
import { slugSchema } from "@contracts/slug/slug.schema";

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
 *
 * ─── Évolution navigation (socle slugs) ───────────────────────────────────
 *
 * Ajout d'un `slug String @unique` saisi par l'admin (pré-rempli via
 * `slugify` côté front, validé par `slugSchema`, stable au renommage) et
 * d'un `getBySlug` public pour la page détail `/evenements/[slug]`.
 * Particularité : le slug est la **première** contrainte d'unicité d'Event
 * (il n'en avait aucune). Les mutations gagnent donc une gestion P2002
 * qu'elles n'avaient pas — au create (où il n'y avait aucun `catch`) et à
 * l'update (où seul P2025 était traité).
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

const audienceEnum = z.enum(["KIDS", "TEENAGERS", "ADULTS", "ALL_AGES"]);

const userIdSchema = z.string().trim().min(1);

const createInput = z
  .object({
    label: z.string().trim().min(1).max(255),
    slug: slugSchema,
    content: pageContentSchemaV1,
    audience: audienceEnum,

    // Rattachements, tous optionnels en Zod — au moins un requis via
    // `.refine` en bas.
    //
    // Un événement présente 0..N disciplines ENSEIGNÉES (forum des
    // associations, démonstration multi-disciplines) et 0..N disciplines non
    // enseignées (« Calligraphie chinoise »).
    disciplineIds: z.array(z.number().int().positive()).optional(),
    externalDisciplineLabels: z
      .array(z.string().trim().min(1).max(120))
      .optional(),
    originId: z.number().int().positive().nullable().optional(),

    organizerId: userIdSchema,
    publicationDate: z.coerce.date().nullable().optional(),
  })
  .refine(
    (data) =>
      (data.disciplineIds ?? []).length > 0 ||
      (data.externalDisciplineLabels ?? []).length > 0 ||
      (data.originId !== null && data.originId !== undefined),
    {
      message:
        "At least one of disciplineIds, externalDisciplineLabels, or originId must be provided.",
      path: ["disciplineIds"],
    },
  );

const updateInput = z.object({
  id: z.number().int().positive(),
  label: z.string().trim().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  content: pageContentSchemaV1.optional(),
  audience: audienceEnum.optional(),

  // Validation « au moins un des trois » faite en router après merge
  // avec l'état actuel en DB (Zod ne connaît pas l'état actuel).
  disciplineIds: z.array(z.number().int().positive()).optional(),
  externalDisciplineLabels: z
    .array(z.string().trim().min(1).max(120))
    .optional(),
  originId: z.number().int().positive().nullable().optional(),

  organizerId: userIdSchema.optional(),
  publicationDate: z.coerce.date().nullable().optional(),
});

/* -------------------------------------------------------------------------- */
/*                             INTERNAL HELPERS                               */
/* -------------------------------------------------------------------------- */

/** Vérifie que TOUTES les disciplines existent (0..N). */
async function assertDisciplinesExist(
  prisma: PrismaClient,
  disciplineIds: number[],
): Promise<void> {
  if (disciplineIds.length === 0) return;
  const unique = [...new Set(disciplineIds)];
  const found = await prisma.discipline.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  });
  const foundIds = new Set(found.map((d) => d.id));
  const missing = unique.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Discipline(s) not found: ${missing.join(", ")}.`,
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
        include: {
          // Disciplines enseignées (0..N) — alimente la colonne
          // « rattachement » de la table admin.
          disciplineLinks: {
            select: { discipline: { select: { name: true } } },
          },
        },
      });
    }),

  /**
   * Liste légère des événements pour le picker de l'uploader.
   * `protectedProcedure` SANS `manage_events` : tout membre authentifié peut
   * déposer des photos sur un événement, même s'il ne peut pas l'éditer.
   * Brouillons inclus — un événement peut être préparé avant sa publication.
   */
  listForUpload: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      select: { id: true, label: true, slug: true },
      orderBy: [
        { publicationDate: { sort: "desc", nulls: "first" } },
        { createdAt: "desc" },
      ],
    });
  }),

  getAllByDiscipline: publicProcedure
    .input(z.object({ disciplineId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      // Via la jointure : capte AUSSI les événements multi-disciplines,
      // que l'ancienne colonne `disciplineId` (1 seule) ratait.
      return ctx.prisma.event.findMany({
        where: {
          disciplineLinks: { some: { disciplineId: input.disciplineId } },
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

  /**
   * Lookup admin par id — brouillons/programmés inclus.
   * Alimente la page d'édition `/dashboard/events/[id]/edit`.
   */
  getByIdAdmin: protectedProcedure
    .use(requirePermission("manage_events"))
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        relationLoadStrategy: "join",
        include: {
          sessions: { orderBy: { date: "asc" } },
          // Disciplines enseignées (0..N) — alimente le formulaire admin.
          disciplineLinks: {
            select: { disciplineId: true, discipline: { select: { name: true } } },
          },
        },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found." });
      }
      return event;
    }),

  /**
   * Lookup public par slug — alimente `/evenements/[slug]`.
   * Seuls les events PUBLIÉS sont visibles ; un brouillon/programmé
   * renvoie NOT_FOUND (on ne révèle pas son existence publiquement).
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findFirst({
        where: {
          slug: input.slug,
          publicationDate: { not: null, lte: new Date() },
        },
        relationLoadStrategy: "join",
        include: {
          sessions: { orderBy: { date: "asc" } },
          // Disciplines enseignées (0..N) — pour l'affichage public.
          disciplineLinks: {
            select: {
              disciplineId: true,
              discipline: { select: { name: true, slug: true } },
            },
          },
        },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found." });
      }
      return event;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_events"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      // ─── Validations pré-transaction ───────────────────────────────────

      const disciplineIds = [...new Set(input.disciplineIds ?? [])];
      const externalLabels = [...new Set(input.externalDisciplineLabels ?? [])];

      await assertDisciplinesExist(ctx.prisma, disciplineIds);
      await assertOriginExists(ctx.prisma, input.originId);
      await assertUserExists(ctx.prisma, input.organizerId);

      // ─── Transaction : create event + sync references ──────────────────

      return await ctx.prisma.$transaction(async (tx) => {
        let created;
        try {
          created = await tx.event.create({
            data: {
              label: input.label,
              slug: input.slug,
              content: input.content as Prisma.InputJsonValue,
              audience: input.audience,
              // Nouvelle vérité : la jointure + le tableau de labels.
              disciplineLinks: {
                create: disciplineIds.map((disciplineId) => ({ disciplineId })),
              },
              externalDisciplineLabels: externalLabels,
              originId: input.originId ?? null,
              organizerId: input.organizerId,
              publicationDate: input.publicationDate ?? null,
            },
          });
        } catch (err) {
          // `slug` est la seule contrainte unique d'Event — un P2002 ne
          // peut donc venir que de lui. On garde le test sur `target`
          // par cohérence avec discipline/stage et pour rester robuste
          // si une autre contrainte unique apparaît plus tard.
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            const t = err.meta?.target;
            const onSlug = Array.isArray(t)
              ? t.includes("slug")
              : String(t ?? "").includes("slug");
            if (onSlug) {
              throw new TRPCError({
                code: "CONFLICT",
                message: "This slug is already used. Choose a different one.",
              });
            }
          }
          throw err;
        }

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
          externalDisciplineLabels: true,
          originId: true,
          disciplineLinks: { select: { disciplineId: true } },
        },
      });
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found.",
        });
      }

      const disciplinesChanged = rest.disciplineIds !== undefined;
      const labelsChanged = rest.externalDisciplineLabels !== undefined;

      const mergedDisciplineIds = disciplinesChanged
        ? [...new Set(rest.disciplineIds ?? [])]
        : existing.disciplineLinks.map((l) => l.disciplineId);
      const mergedExternalLabels = labelsChanged
        ? [...new Set(rest.externalDisciplineLabels ?? [])]
        : existing.externalDisciplineLabels;
      const mergedOriginId =
        rest.originId !== undefined ? rest.originId : existing.originId;

      // Validation « au moins un des trois » après merge.
      const hasAtLeastOne =
        mergedDisciplineIds.length > 0 ||
        mergedExternalLabels.length > 0 ||
        mergedOriginId !== null;

      if (!hasAtLeastOne) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "An event must keep at least one of disciplineIds, externalDisciplineLabels, or originId set.",
        });
      }

      // Validations existence si champs modifiés
      if (disciplinesChanged) {
        await assertDisciplinesExist(ctx.prisma, mergedDisciplineIds);
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
            slug: rest.slug,
            audience: rest.audience,
            // La jointure est synchronisée juste après.
            externalDisciplineLabels: labelsChanged
              ? mergedExternalLabels
              : undefined,
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
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
              const t = err.meta?.target;
              const onSlug = Array.isArray(t)
                ? t.includes("slug")
                : String(t ?? "").includes("slug");
              if (onSlug) {
                throw new TRPCError({
                  code: "CONFLICT",
                  message: "This slug is already used. Choose a different one.",
                });
              }
            }
            if (err.code === "P2025") {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Event not found.",
              });
            }
          }
          throw err;
        }

        // Synchro de la jointure (source de vérité des disciplines).
        if (disciplinesChanged) {
          await tx.eventDiscipline.deleteMany({ where: { eventId: id } });
          if (mergedDisciplineIds.length > 0) {
            await tx.eventDiscipline.createMany({
              data: mergedDisciplineIds.map((disciplineId) => ({
                eventId: id,
                disciplineId,
              })),
              skipDuplicates: true,
            });
          }
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