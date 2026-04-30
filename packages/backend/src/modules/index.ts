import { router } from "@backend/trpc/core";

import { authRouter } from "@backend/modules/auth/router";
import { userRouter } from "@backend/modules/users/router";
import { roleRouter } from "@backend/modules/roles/router";
import { sessionRouter } from "@backend/modules/session/router";
import { cloudinaryRouter } from "@backend/modules/cloudinary/router";
import { trashRouter } from "@backend/modules/trash/router";
import { permissionRouter } from "@backend/modules/permissions/router";
import { categoryRouter } from "@backend/modules/categories/router";
import { courseRouter } from "@backend/modules/courses/router";
import { disciplineRouter } from "@backend/modules/disciplines/router";
import { stageRouter } from "@backend/modules/stages/router";
import { stageSessionRouter } from "@backend/modules/stageSessions/router";
import { postRouter } from "@backend/modules/posts/router";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  role: roleRouter,
  session: sessionRouter,
  cloudinary: cloudinaryRouter,
  trash: trashRouter,
  permission: permissionRouter,
  category: categoryRouter,
  course: courseRouter,
  discipline: disciplineRouter,
  stage: stageRouter,
  stageSession: stageSessionRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;