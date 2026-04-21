import { router } from "../trpc/core";

import { authRouter } from "./auth/router";
import { userRouter } from "./users/router";
import { roleRouter } from "./roles/router";
import { sessionRouter } from "./session/router";
import { cloudinaryRouter } from "./cloudinary/router";
import { trashRouter } from "./trash/router";
import { permissionRouter } from "./permissions/router";
import { categoryRouter } from "./categories/router";
import { courseRouter } from "./courses/router";

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
});

export type AppRouter = typeof appRouter;