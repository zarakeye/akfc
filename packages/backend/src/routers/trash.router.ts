import { z } from "zod";

import { router, protectedProcedure } from "packages/backend/src/trpc/core";
import { isAdmin } from "packages/backend/src/routers/middleware";

import type { ListBinOutput } from "packages/contracts/src/trash/trash.dto";
import type { ReadTrashFolderOutput } from "packages/contracts/src/trash/trash-node.types";
import type {
  TrashToBinOutput,
  RestoreFromBinOutput,
  DeleteForeverOutput,
} from "packages/contracts/src/trash/trash.mutations";

import { listBin } from "packages/backend/src/services/trash/listBin.service";
import { readTrashFolder } from "packages/backend/src/services/trash/readTrashFolder.service";
import { trashToBin } from "packages/backend/src/services/trash/trashToBin.service";
import { restoreFromBin } from "packages/backend/src/services/trash/restoreFromBin.service";
import { deleteForever } from "packages/backend/src/services/trash/deleteForever.service";

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
});

const restoreFromBinInputSchema = z.object({
  appRoot: z.string().min(1),
  ids: z.array(z.string().min(1)).min(1),
});

const deleteForeverInputSchema = z.object({
  appRoot: z.string().min(1),
  ids: z.array(z.string().min(1)).min(1),
});

export const trashRouter = router({
  /**
   * Liste plate du bin (AKFC/bin)
   * Tri: trashedAt desc
   */
  listBin: protectedProcedure
    .use(isAdmin)
    .input(listBinInputSchema)
    .query(async ({ ctx, input }): Promise<ListBinOutput> => {
      return listBin({ prisma: ctx.prisma, input });
    }),

  /**
   * Navigation lecture seule dans un dossier trash.
   * Renvoie uniquement les enfants directs (choix A validé).
   */
  readTrashFolder: protectedProcedure
    .use(isAdmin)
    .input(readTrashFolderInputSchema)
    .query(async ({ ctx, input }): Promise<ReadTrashFolderOutput> => {
      return readTrashFolder({ prisma: ctx.prisma, input });
    }),

  /**
   * Envoie un ou plusieurs contenus vers la corbeille.
   */
  trashToBin: protectedProcedure
    .use(isAdmin)
    .input(trashToBinInputSchema)
    .mutation(async ({ ctx, input }): Promise<TrashToBinOutput> => {
      return trashToBin({ prisma: ctx.prisma, input });
    }),

  /**
   * Restaure des entrées du bin.
   *
   * Design validé :
   * - Toujours vers previousPath.
   * - En cas de collision => auto-rename du contenu restauré en suffixant avec trashedAt.
   * - Jamais de popup.
   */
  restoreFromBin: protectedProcedure
    .use(isAdmin)
    .input(restoreFromBinInputSchema)
    .mutation(async ({ ctx, input }): Promise<RestoreFromBinOutput> => {
      return restoreFromBin({ prisma: ctx.prisma, input });
    }),

  /**
   * Suppression définitive.
   */
  deleteForever: protectedProcedure
    .use(isAdmin)
    .input(deleteForeverInputSchema)
    .mutation(async ({ ctx, input }): Promise<DeleteForeverOutput> => {
      return deleteForever({ prisma: ctx.prisma, input });
    }),
});
