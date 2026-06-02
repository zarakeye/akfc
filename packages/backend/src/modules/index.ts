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
import { eventRouter } from "@backend/modules/events/router";
import { eventSessionRouter } from "@backend/modules/eventSessions/router";
import { postRouter } from "@backend/modules/posts/router";
import { storageRouter } from "@backend/modules/storage/router";
import { mediaRouter } from "@backend/modules/media/router";
import { originRouter } from "@backend/modules/origins/router";
import { commentRouter } from "@backend/modules/comments/router";
import { reactionRouter } from "@backend/modules/reactions/router";
import { pollRouter } from "@backend/modules/polls/router";

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
  origin: originRouter,
  stage: stageRouter,
  stageSession: stageSessionRouter,
  event: eventRouter,
  eventSession: eventSessionRouter,
  post: postRouter,
  storage: storageRouter,
  media: mediaRouter,
  comment: commentRouter,
  reaction: reactionRouter,
  poll: pollRouter,
});

export type AppRouter = typeof appRouter;
