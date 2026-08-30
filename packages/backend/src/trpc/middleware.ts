import { TRPCError } from "@trpc/server";
import { t } from "@backend/trpc/core";

export const isAdmin = t.middleware(({ ctx, next }) => {
  const user = ctx.sessionClient?.user;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }

  if (!user.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Administrator access required.",
    });
  }

  return next();
});