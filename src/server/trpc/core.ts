import { initTRPC } from '@trpc/server';
import { prisma } from '@server/prisma';
import superjson from 'superjson';
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { UserEnhanced, SessionEnhanced } from '@/types';


export interface SessionCtx {
  prisma: typeof prisma;
  user: UserEnhanced;
  session: SessionEnhanced;
  cookies: Promise<ReadonlyRequestCookies | null> | ReadonlyRequestCookies | null;
}

export const t = initTRPC.context<SessionCtx>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.userId) {
    throw new Error('UNAUTHORIZED');
  }

  return next();
});