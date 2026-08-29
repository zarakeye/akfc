import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";
import { isSpaceEmpty } from "@backend/modules/storage/isSpaceEmpty.service";
import slugify from "slugify";

import { pageContentSchemaV1, parsePageContentV1 } from "@contracts/page";
import { slugSchema } from "@contracts/slug/slug.schema";

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
 *
 * ─── Évolution navigation (socle slugs + DisciplineFamily) ────────────────
 *
 * Trois changements adressés ici :
 *
 *   1. `slug String @unique` — saisi par l'admin (le front le pré-remplit
 *      via `slugify`, mais il reste éditable), validé par `slugSchema`, et
 *      stable au renommage. Sert la page publique `/disciplines/[slug]`.
 *
 *   2. `Discipline.family` (String? libre) → `familyId` (Int? FK vers
 *      DisciplineFamily). Même logique qu'`originId` : un id résolu depuis
 *      l'admin, dont l'existence est validée côté router. Promeut le
 *      regroupement de menu (« Kung-fu », etc.) en entité, pour fuir les
 *      doublons orthographiques d'un champ libre.
 *
 *   3. `getBySlug` (publicProcedure) — lookup par slug pour la page détail.
 *
 * Comme `slug` introduit une 2ᵉ contrainte d'unicité (en plus de
 * `(categoryId, name)`), les `catch` P2002 distinguent désormais le conflit
 * de slug du conflit de nom via `err.meta.target`.
 */

/* -------------------------------------------------------------------------- */
/*                           SHARED VALIDATION SCHEMAS                        */
/* -------------------------------------------------------------------------- */

const disciplineTypeEnum = z.enum(["MARTIAL_ART", "CALLIGRAPHY"]);

const createInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  type: disciplineTypeEnum,

  // ID de la famille de disciplines (relation vers le modèle
  // DisciplineFamily). Nullable : une discipline peut ne pas être
  // rattachée à une famille (création progressive).
  familyId: z.number().int().positive().nullable().optional(),

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

  // Présentation synthétique pour l'accueil. Optionnelle : la colonne a un
  // composite vide par défaut, et un formulaire qui ne la renseigne pas doit
  // continuer de fonctionner.
  summary: pageContentSchemaV1.optional(),

  // Image de la carte d'accueil. Nullable : une discipline peut ne pas en
  // avoir, et la carte se rend alors sans illustration.
  summaryMediaId: z.string().min(1).nullable().optional(),

  categoryId: z.number().int().positive(),
  instructorId: z.string().trim().min(1),
  publicationDate: z.coerce.date().nullable().optional(),
});

const updateInput = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  type: disciplineTypeEnum.optional(),

  // familyId nullable + optional : permet d'attacher, détacher, ou
  // ne pas toucher selon `undefined` vs `null` vs un id.
  familyId: z.number().int().positive().nullable().optional(),

  school: z.string().trim().min(1).max(120).nullable().optional(),
  classification: z.string().trim().min(1).max(120).nullable().optional(),

  // originId nullable + optional : permet d'attacher, détacher, ou
  // ne pas toucher selon `undefined` vs `null` vs un id.
  originId: z.number().int().positive().nullable().optional(),

  // description optional : si non fourni, le composite reste tel qu'il
  // est en DB. Si fourni, la sync transactionnelle s'applique.
  description: pageContentSchemaV1.optional(),

  // summary optional, même logique que description : non fourni = inchangé.
  summary: pageContentSchemaV1.optional(),

  // nullable + optional : permet d'attacher, de détacher, ou de ne pas
  // toucher, selon `undefined` vs `null` vs un identifiant.
  summaryMediaId: z.string().min(1).nullable().optional(),

  instructorId: z.string().trim().min(1).optional(),
  publicationDate: z.coerce.date().nullable().optional(),
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

  /**
   * Disciplines PUBLIÉES uniquement (publicationDate non null et passée).
   * Alimente les consommateurs publics (menu « Nos activités »). L'admin
   * utilise `getAll` (toutes, brouillons compris).
   */
  getAllPublished: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.discipline.findMany({
      where: { publicationDate: { not: null, lte: new Date() } },
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    });
  }),

  /**
   * Disciplines du menu « Nos activités » : PUBLIÉES pour tous, PLUS les
   * brouillons si la session est ADMIN. Gating SERVEUR — un visiteur
   * non-admin ne peut pas récupérer les brouillons via cette query.
   */
  getAllForMenu: publicProcedure.query(async ({ ctx }) => {
    const isAdmin = ctx.sessionClient?.user?.isAdmin ?? false;
    return ctx.prisma.discipline.findMany({
      where: isAdmin ? {} : { publicationDate: { not: null, lte: new Date() } },
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

  /**
   * Lookup par slug — alimente la page publique `/disciplines/[slug]`.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ ctx, input }) => {
      const discipline = await ctx.prisma.discipline.findUnique({
        where: { slug: input.slug },
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

      if (input.familyId !== null && input.familyId !== undefined) {
        const family = await ctx.prisma.disciplineFamily.findUnique({
          where: { id: input.familyId },
          select: { id: true },
        });
        if (!family) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `DisciplineFamily not found (id=${input.familyId}).`,
          });
        }
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
              slug: input.slug,
              type: input.type,
              familyId: input.familyId ?? null,
              school: input.school ?? null,
              classification: input.classification ?? null,
              originId: input.originId ?? null,
              description: input.description as Prisma.InputJsonValue,
              summary:
                input.summary === undefined
                  ? undefined
                  : (input.summary as Prisma.InputJsonValue),
              summaryMediaId: input.summaryMediaId ?? null,
              categoryId: input.categoryId,
              instructorId: input.instructorId,
              publicationDate: input.publicationDate ?? null,
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
                : "A discipline with this name already exists in this category.",
            });
          }
          throw err;
        }

        // UNION des deux composites. `syncPageMediaReferences` recalcule
        // l'ensemble COMPLET des références de la page : ne lui passer que la
        // description ferait passer les images du résumé pour orphelines.
        await syncPageMediaReferences(tx, {
          pageType: "DISCIPLINE",
          pageId: String(created.id),
          newContent: {
            version: 1,
            blocks: [
              ...input.description.blocks,
              ...(input.summary?.blocks ?? []),
            ],
          },
          // L'image de carte vit hors composite : sans cette ligne elle
          // échapperait au recensement et passerait pour orpheline.
          extraMediaIds: input.summaryMediaId ? [input.summaryMediaId] : [],
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

      // familyId : on valide seulement si fourni ET non-null
      // (null = détachement explicite, autorisé).
      if (rest.familyId !== undefined && rest.familyId !== null) {
        const family = await ctx.prisma.disciplineFamily.findUnique({
          where: { id: rest.familyId },
          select: { id: true },
        });
        if (!family) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `DisciplineFamily not found (id=${rest.familyId}).`,
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
            slug: rest.slug,
            type: rest.type,
            familyId: rest.familyId,
            school: rest.school,
            classification: rest.classification,
            originId: rest.originId,
            instructorId: rest.instructorId,
            description:
              rest.description === undefined
                ? undefined
                : (rest.description as Prisma.InputJsonValue),
            summary:
              rest.summary === undefined
                ? undefined
                : (rest.summary as Prisma.InputJsonValue),
            summaryMediaId: rest.summaryMediaId,
            publicationDate: rest.publicationDate,
          };

          updated = await tx.discipline.update({
            where: { id },
            data, // description undefined → Prisma ne touche pas au champ
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
                  : "A discipline with this name already exists in this category.",
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

        // La sync n'est appelée que si l'update a touché à l'un des deux
        // composites. Si l'admin met juste à jour `name` ou `family`, les
        // références médias n'ont pas changé.
        //
        // On relit la ligne APRÈS l'écriture plutôt que de raisonner sur ce
        // qui a été fourni : l'union porte alors sur l'état réel, quel que
        // soit le champ modifié, et il n'y a aucun cas particulier à oublier.
        // La sync recalculant l'ensemble COMPLET des références de la page,
        // lui passer un seul des deux composites effacerait les références de
        // l'autre.
        if (
          rest.description !== undefined ||
          rest.summary !== undefined ||
          rest.summaryMediaId !== undefined
        ) {
          const row = await tx.discipline.findUnique({
            where: { id },
            select: {
              description: true,
              summary: true,
              summaryMediaId: true,
            },
          });

          await syncPageMediaReferences(tx, {
            pageType: "DISCIPLINE",
            pageId: String(id),
            newContent: {
              version: 1,
              blocks: [
                ...parsePageContentV1(row?.description).blocks,
                ...parsePageContentV1(row?.summary).blocks,
              ],
            },
            extraMediaIds: row?.summaryMediaId ? [row.summaryMediaId] : [],
          });
        }

        return updated;
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Dépendances métier : on refuse plutôt que de cascader (Course/Stage/
      // Event). Le contenu du DOSSIER est traité à part, par un check PHYSIQUE
      // (isSpaceEmpty) — pas par les lignes MediaAsset, qui persistent après un
      // vidage et donneraient un faux « non vide ».
      const [courseCount, stageCount, eventCount] = await Promise.all([
        ctx.prisma.course.count({ where: { disciplineId: input.id } }),
        ctx.prisma.stage.count({ where: { disciplineId: input.id } }),
        ctx.prisma.eventDiscipline.count({ where: { disciplineId: input.id } }),
      ]);

      const deps: string[] = [];
      if (courseCount > 0) deps.push(`${courseCount} cours`);
      if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
      if (eventCount > 0) deps.push(`${eventCount} événement(s)`);
      if (deps.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Impossible de supprimer la discipline : ${deps.join(
            ", ",
          )} y font encore référence. Traitez-les d'abord.`,
        });
      }

      // Résout le dossier : `${appRoot}/<slug(cat.type)>/<slug(name)>`
      // (aligné sur resolvePendingUploadFolder / protectedDisciplineFolder).
      const disc = await ctx.prisma.discipline.findUnique({
        where: { id: input.id },
        select: { id: true, name: true, categoryId: true },
      });
      if (!disc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Discipline not found." });
      }
      const cat = await ctx.prisma.category.findUnique({
        where: { id: disc.categoryId },
        select: { type: true },
      });
      const slug = (v: string) => slugify(v, { lower: true, strict: true });
      const folderPath = cat
        ? `${ctx.appRoot}/${slug(cat.type)}/${slug(disc.name) || `disc-${disc.id}`}`
        : null;

      // Le dossier doit être VIDE (contrôle physique, cf. finder).
      if (
        folderPath &&
        !(await isSpaceEmpty({
          prisma: ctx.prisma,
          appRoot: ctx.appRoot,
          path: folderPath,
        }))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Le dossier de la discipline « ${disc.name} » n'est pas vide. Videz-le (fichiers et sous-dossiers) avant de supprimer la discipline.`,
        });
      }

      // Transaction : refs média → détache les MediaAsset orphelines (dossier
      // vérifié vide, disciplineId nullable) → supprime la ligne Folder → delete.
      return await ctx.prisma.$transaction(async (tx) => {
        await syncPageMediaReferences(tx, {
          pageType: "DISCIPLINE",
          pageId: String(input.id),
          newContent: null,
        });

        await tx.mediaAsset.updateMany({
          where: { disciplineId: input.id },
          data: { disciplineId: null },
        });

        if (folderPath) {
          await tx.folder.deleteMany({
            where: { appRoot: ctx.appRoot, fullPath: folderPath },
          });
        }

        try {
          return await tx.discipline.delete({ where: { id: input.id } });
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