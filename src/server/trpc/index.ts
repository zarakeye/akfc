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
import { getUserFromSessionJWT } from '@/lib/session/session.server';

/**
 * Retrieves the user associated with the current session cookie.
 * If the session cookie is not present, or if the session has expired, the function returns null.
 * @returns {Promise<SessionCtx>} - The user associated with the session cookie, or null if the session cookie is not present or has expired.
 */
export async function createContext(): Promise<SessionCtx> {
  const cookieStore = await cookies();

  const user = await getUserFromSessionJWT();
  console.log('🔑 USER FROM CONTEXT:', user);
  
  if (!user) return { prisma, user: null, session: null, cookies: cookieStore };
  let session: SessionCtx['session'] = null;

  try {
    // 🔑 Verify the JWT
    session = await prisma.session.findFirst({
      where: { userId: user.id },
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

    if (!session || session.expiresAt < new Date()) return { prisma, user: null, session: null, cookies: cookieStore };
    if (session.user && !session.user.role) throw new Error("User role missing !");

    // ⭐ NORMALISATION
    const normalizedSession = {
      ...session,
      user
    };

    return {
      prisma,
      user,
      session: normalizedSession,
      cookies: cookieStore,
    };
  } catch (err) {
    console.error('Error creating context', err);
    return { prisma, user: null, session: null, cookies: cookieStore };
  }
}

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