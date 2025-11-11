import { router, publicProcedure } from "@server/trpc";
import { z } from "zod";

export const roleRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findUnique({
        where: { id: input.id },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      return role;
    }),
});