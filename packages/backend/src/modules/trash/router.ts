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
import { restoreFromBin } from "@backend/modules/trash/services/restoreFromBin.service";
import { deleteForever } from "@backend/modules/trash/services/deleteForever.service";

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
      return trashToBin({ prisma: ctx.prisma, input });
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
});