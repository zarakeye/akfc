import { initTRPC } from '@trpc/server';
import { prisma } from '@server/prisma';
import { Role, User } from '@prisma/client';
import superjson from 'superjson';

export interface SessionCtx {
  prisma: typeof prisma;
  user: (User & {
    role: Role & { permissions: [] };
  }) | null;
}

export const t = initTRPC.context<SessionCtx>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('UNAUTHORIZED');
  }

  return next();
})