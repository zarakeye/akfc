import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { SessionClient } from '@/types/session.types';
import { prisma } from '@server/prisma';


export interface SessionCtx {
  sessionClient: SessionClient | null;
  prisma: typeof prisma
}

export const t = initTRPC.context<SessionCtx>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.sessionClient?.user) {
    throw new Error('UNAUTHORIZED');
  }

  return next();
});