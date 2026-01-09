import { authRouter } from '../routers/auth.router';
import { roleRouter } from '../routers/role.router';
import { userRouter } from '../routers/user.router';
import { permissionRouter } from '../routers/permission.router';
import { categoryRouter } from '@/server/routers/category.router';
import { sessionRouter } from '../routers/session.router';
import { postRouter } from '@/server/routers/post.router';
import { uploadImagesRouter } from '../routers/uploadImages.router';
import { courseRouter } from '../routers/course.router';
import { router } from '@server/trpc/core';
import type { SessionCtx } from '@server/trpc/core';
import { UserEnhanced } from '@/types';
import { startSessionCleanupCron } from '../lib/session/sessionCleanup';
import { getSessionFromRequest } from '../auth/getSessionFromRequest';
/**
 * Retrieves the user associated with the current session cookie.
 * If the session cookie is not present, or if the session has expired, the function returns null.
 * @returns {Promise<SessionCtx>} - The user associated with the session cookie, or null if the session cookie is not present or has expired.
 */
export async function createContext(): Promise<SessionCtx> {
  try {
    const session = await getSessionFromRequest();

    return {
      user: session?.user as UserEnhanced,
      session,
    };
  } catch (err) {
    console.error('Error creating context', err);
    return {
      user: null,
      session: null,
    };
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