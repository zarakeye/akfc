import { router } from "@/server/trpc/core";

import { authRouter } from "@/server/routers/auth.router";
import { userRouter } from "@/server/routers/user.router";
import { roleRouter } from "@/server/routers/role.router";
import { sessionRouter } from "@/server/routers/session.router";
import { cloudinaryRouter } from "@/server/routers/cloudinary.router";
import { trashRouter } from "@/server/routers/trash.router";
import { permissionRouter } from "@server/routers/permission.router";
import { categoryRouter } from "@server/routers/category.router";
import { courseRouter } from "../routers/course.router";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  role: roleRouter,
  session: sessionRouter,
  cloudinary: cloudinaryRouter,
  trash: trashRouter,
  permission: permissionRouter,
  category: categoryRouter,
  course: courseRouter
});

export type AppRouter = typeof appRouter;