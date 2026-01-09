import { prisma } from '@server/prisma';
import { authRouter } from '../routers/auth.router';
import { roleRouter } from '../routers/role.router';
import { userRouter } from '../routers/user.router';
import { permissionRouter } from '../routers/permission.router';
import { categoryRouter } from '@/server/routers/category.router';
import { sessionRouter } from '../routers/session.router';
import { postRouter } from '@/server/routers/post.router';
import { uploadImagesRouter } from '../routers/uploadImages.router';
import { courseRouter } from '../routers/course.router';
import { cookies } from 'next/headers';
import { router } from '@server/trpc/core';
import type { SessionCtx } from '@server/trpc/core';
import { COOKIE_NAME } from '@/lib/constants';
import jwt from 'jsonwebtoken';
import { UserEnhanced } from '@/types';
import { startSessionCleanupCron } from '../lib/session/sessionCleanup';
import { start } from 'repl';

/**
 * Retrieves the user associated with the current session cookie.
 * If the session cookie is not present, or if the session has expired, the function returns null.
 * @returns {Promise<SessionCtx>} - The user associated with the session cookie, or null if the session cookie is not present or has expired.
 */
export async function createContext(): Promise<SessionCtx> {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return {
    prisma,
    user: null,
    session: null,
    cookies: cookieStore
  };

  try {
    // 🔑 Verify the JWT
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { sessionId: string; userId: string };

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!session) {
      cookieStore.delete(COOKIE_NAME);
      return {
        prisma,
        user: null,
        session: null,
        cookies: cookieStore
      };
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      cookieStore.delete(COOKIE_NAME);

      return {
        prisma,
        user: null,
        session: null,
        cookies: cookieStore
      };
    }


    if (session.user && !session.user.role) throw new Error("User role missing !");

   if (!session.user.role) throw new Error("User role missing !");

    return {
      prisma,
      user: session.user as UserEnhanced,
      session,
      cookies: cookieStore,
    };
  } catch (err) {
    console.error('Error creating context', err);
    return { prisma, user: null, session: null, cookies: cookieStore };
  }
}

// Lance le cron dès que le serveur démarre
startSessionCleanupCron();

export const appRouter = router({
  auth: authRouter,
  role: roleRouter,
  user: userRouter,
  permission: permissionRouter,
  category: categoryRouter,
  post: postRouter,
  upload: uploadImagesRouter,
  course: courseRouter,
  session: sessionRouter
});

export type AppRouter = typeof appRouter;