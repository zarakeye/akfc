import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { prisma } from '@server/prisma';
import { getUserFromSessionJWT } from '@lib/session';
import { authRouter } from './routers/auth';
import { roleRouter } from './routers/role';
import { permissionRouter } from './routers/permission';

interface SessionCtx {
  prisma: typeof prisma;
  user: Awaited<ReturnType<typeof getUserFromSessionJWT>> | null;
}

export async function createContext(): Promise<SessionCtx> {
  const user = await getUserFromSessionJWT();
  return { prisma, user };
}

const t = initTRPC.context<SessionCtx>().create({
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

export const appRouter = router({
  auth: authRouter,
  role: roleRouter,
  permission: permissionRouter
});
export type AppRouter = typeof appRouter;