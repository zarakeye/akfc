import { router } from "../trpc/core"

import { authRouter } from "./auth.router"
import { userRouter } from "./user.router"
import { roleRouter } from "./role.router"
import { sessionRouter } from "./session.router"
import { cloudinaryRouter } from "./cloudinary.router"
import { trashRouter } from "./trash.router"
import { permissionRouter } from "./permission.router"
import { categoryRouter } from "./category.router"
import { courseRouter } from "./course.router"

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
})

export type AppRouter = typeof appRouter