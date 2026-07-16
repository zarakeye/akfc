import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

import type { ListBinOutput } from "@contracts/trash/trash.dto";
import type { ReadTrashFolderOutput } from "@contracts/trash/trash-node.types";
import type {
  TrashToBinOutput,
  RestoreFromBinOutput,
  DeleteForeverOutput,
} from "@contracts/trash/trash.mutations";

import { listBin } from "@backend/modules/trash/services/listBin.service";
import { readTrashFolder } from "@backend/modules/trash/services/readTrashFolder.service";
import { trashToBin } from "@backend/modules/trash/services/trashToBin.service";
import { resolvePhysicalLocations } from "@backend/modules/storage/resolvePhysicalLocations.service";
import { restoreFromBin } from "@backend/modules/trash/services/restoreFromBin.service";
import { deleteForever } from "@backend/modules/trash/services/deleteForever.service";
import { purge, type PurgeOutput } from "@backend/modules/trash/services/purge.service";

/**
 * trash.router.ts
 *
 * Router tRPC dédié à la corbeille.
 *
 * IMPORTANT (design validé) :
 * - Bin = lecture + restore + delete définitif
 * - Le stockage Cloudinary réel est caché : `${appRoot}/bin/.trash/<uuid>/...`
 * - L'utilisateur ne voit jamais `.trash/<uuid>`
 */

const adminProcedure = protectedProcedure.use(isAdmin);

const listBinInputSchema = z.object({
  appRoot: z.string().min(1),
  cursor: z.string().min(1).nullable().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().min(1).optional(),
});

const readTrashFolderInputSchema = z.object({
  appRoot: z.string().min(1),
  trashId: z.string().min(1),
  relativePath: z.string().optional(),
});

const trashToBinInputSchema = z.object({
  appRoot: z.string().min(1),
  sources: z
    .array(
      z.union([
        z.object({ kind: z.literal("folder"), fullPath: z.string().min(1) }),
        z.object({ kind: z.literal("file"), fullPath: z.string().min(1) }),
        z.object({ kind: z.literal("selection"), roots: z.array(z.string().min(1)).min(1) }),
      ])
    )
    .min(1),
  /**
   * Les `fullPath` / `roots` ci-dessus sont exprimés en chemins LOGIQUES
   * (cf. le flag `logical` du router storage).
   *
   * Un appelant qui lit le finder en vue pliée DOIT lever ce flag ici : les
   * chemins de DOSSIER qu'il détient n'ont pas d'emplacement physique unique
   * (un dossier logique vit dans 1..N strates). Les chemins de FICHIER, eux,
   * sont déjà physiques — `FinderNode.id` porte le `storagePath` — et la
   * projection les laisse passer sans requête.
   *
   * Baissé (le défaut), rien ne change.
   */
  logical: z.boolean().optional(),
});

type TrashToBinSource = z.infer<typeof trashToBinInputSchema>["sources"][number];

/**
 * Le type du client Prisma, dérivé du service voisin plutôt que réimporté
 * de `@prisma/client` : `trashToBin` prend déjà un `prisma`, son type de
 * paramètre est donc la source de vérité locale. Rien à réinventer, rien à
 * laisser diverger.
 */
type PrismaContext = Parameters<typeof trashToBin>[0]["prisma"];

/**
 * Redescend les sources de mise en corbeille dans l'espace physique.
 *
 * Jeter le dossier logique `AKFC/cours/x`, c'est jeter la copie en attente
 * ET la copie publiée : deux vrais dossiers, donc deux `TrashEntry`, donc
 * deux restaurations possibles vers leurs `previousPath` respectifs. Le
 * schema accepte déjà un TABLEAU de sources — il n'y a donc rien à
 * regrouper et aucune cible à projeter. C'est nettement plus simple que le
 * cas du move.
 *
 * La corbeille elle-même n'est pas concernée par le pliage : `bin` reste un
 * lieu (quarantaine physique + `TrashEntry.previousPath`), et les chemins
 * qui sont déjà dedans traversent intacts. Ce qui est projeté ici, c'est
 * l'ENTRÉE en corbeille, pas son contenu.
 *
 * Transitoire : à l'étape 5 du chantier, la projection devient l'identité et
 * cette fonction se supprime avec le reste du pliage.
 */
async function toPhysicalTrashSources(params: {
  prisma: PrismaContext;
  appRoot: string;
  sources: readonly TrashToBinSource[];
}): Promise<TrashToBinSource[]> {
  const { prisma, appRoot, sources } = params;

  const paths = sources.flatMap((source) =>
    source.kind === "selection" ? source.roots : [source.fullPath],
  );
  const locations = await resolvePhysicalLocations({ prisma, appRoot, paths });
  const physical = (path: string): string[] => locations.get(path) ?? [path];

  return sources.flatMap((source): TrashToBinSource[] => {
    if (source.kind === "selection") {
      return [
        { kind: "selection", roots: source.roots.flatMap(physical) },
      ];
    }
    return physical(source.fullPath).map((fullPath) => ({
      kind: source.kind,
      fullPath,
    }));
  });
}

const restoreFromBinInputSchema = z.object({
  appRoot: z.string().min(1),
  ids: z.array(z.string().min(1)).min(1),
});

const deleteForeverInputSchema = z.object({
  appRoot: z.string().min(1),
  ids: z.array(z.string().min(1)).min(1),
});

// `purge` accepte des **paths Cloudinary** (pas des TrashEntry ids) sous
// `${appRoot}/bin/.trash/...`. Voir purge.service.ts pour la motivation
// (gestion des vestiges absents en DB).
const purgeInputSchema = z.object({
  appRoot: z.string().min(1),
  paths: z.array(z.string().min(1)).min(1),
});

export const trashRouter = router({
  listBin: adminProcedure
    .input(listBinInputSchema)
    .query(async ({ ctx, input }): Promise<ListBinOutput> => {
      return listBin({ prisma: ctx.prisma, input });
    }),

  readTrashFolder: adminProcedure
    .input(readTrashFolderInputSchema)
    .query(async ({ ctx, input }): Promise<ReadTrashFolderOutput> => {
      return readTrashFolder({ prisma: ctx.prisma, input });
    }),

  trashToBin: adminProcedure
    .input(trashToBinInputSchema)
    .mutation(async ({ ctx, input }): Promise<TrashToBinOutput> => {
      const sources = input.logical
        ? await toPhysicalTrashSources({
            prisma: ctx.prisma,
            appRoot: input.appRoot,
            sources: input.sources,
          })
        : input.sources;

      return trashToBin({ prisma: ctx.prisma, input: { ...input, sources } });
    }),

  restoreFromBin: adminProcedure
    .input(restoreFromBinInputSchema)
    .mutation(async ({ ctx, input }): Promise<RestoreFromBinOutput> => {
      return restoreFromBin({ prisma: ctx.prisma, input });
    }),

  deleteForever: adminProcedure
    .input(deleteForeverInputSchema)
    .mutation(async ({ ctx, input }): Promise<DeleteForeverOutput> => {
      return deleteForever({ prisma: ctx.prisma, input });
    }),

  purge: adminProcedure
    .input(purgeInputSchema)
    .mutation(async ({ ctx, input }): Promise<PurgeOutput> => {
      return purge({ prisma: ctx.prisma, input });
    }),
});