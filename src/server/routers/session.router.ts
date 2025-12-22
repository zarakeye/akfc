import { router, protectedProcedure, publicProcedure } from "@server/trpc/core";
import { requirePermission } from "./middleware";
import { z } from "zod";

export const sessionRouter = router({
  update: protectedProcedure
    .use(requirePermission("manage_sessions"))
    .input(z.object({
      id: z.string(),
      token: z.string(),
      userId: z.string(),
      role: z.string(),
      createdAt: z.date(),
      expiresAt: z.date(),      
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.session.update({
        where: { id: input.id },
        data: {
          token: input.token,
        },
      });
    }),

  getSession: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.prisma.session.findMany();
      } catch (error) {
        console.log('Error fetching sessions:', error);
      }
    })
});