import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import {
  cloudinaryMigrationStatus,
  migrateCloudinaryBatch,
} from "@backend/modules/media/services/migrateCloudinaryToR2.service";

/** Migration Cloudinary → R2 (administrateurs). Le client enchaîne les lots jusqu'à remaining = 0. */
export const mediaMigrationRouter = router({
  status: protectedProcedure.use(isAdmin).query(({ ctx }) => cloudinaryMigrationStatus(ctx.prisma)),
  runBatch: protectedProcedure
    .use(isAdmin)
    .input(z.object({ max: z.number().int().min(1).max(20).default(6), exclude: z.array(z.string()).max(5000).default([]) }))
    .mutation(({ ctx, input }) => migrateCloudinaryBatch(ctx.prisma, ctx.appRoot, input.max, input.exclude)),
});
