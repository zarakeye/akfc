import { prisma } from '@server/prisma';
import { authRouter } from '../routers/auth.router';
import { roleRouter } from '../routers/role.router';
import { userRouter } from '../routers/user.router';
import { permissionRouter } from '../routers/permission.router';
import { activityTypeRouter } from '@/server/routers/activityType.router';
import { Role, User } from '@prisma/client';
import { COOKIE_NAME } from '@/lib/constants';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { router } from '@server/trpc/core';
import type { SessionCtx } from '@server/trpc/core';

/**
 * Retrieves the user associated with the current session cookie.
 * If the session cookie is not present, or if the session has expired, the function returns null.
 * @returns {Promise<SessionCtx>} - The user associated with the session cookie, or null if the session cookie is not present or has expired.
 */
export async function createContext(): Promise<SessionCtx> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!cookie) return { prisma, user: null };

  try {
    const payload = jwt.verify(
      cookie.value,
      JWT_SECRET ?? ''
    ) as { sessionId: string; userId: string };

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } } }
          }
        }
      }
    });

    if (!session || session.expiresAt < new Date()) return { prisma, user: null };
    if (!session.user.role) throw new Error("User role missing !");

    const userWithRole = {
      ...session.user,
      role: {
        ...session.user.role,
        permissions: session.user.role.permissions.map(p => p.permission)
      }
    };

    return {
      prisma,
      user: userWithRole as User & { role: Role & { permissions: [] } },
    };
  } catch {
    return { prisma, user: null };
  }  
}

export const appRouter = router({
  auth: authRouter,
  role: roleRouter,
  user: userRouter,
  permission: permissionRouter,
  activityType: activityTypeRouter,

});

export type AppRouter = typeof appRouter;