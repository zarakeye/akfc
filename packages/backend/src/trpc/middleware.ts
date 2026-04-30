import { TRPCError } from "@trpc/server";
import { t } from "@backend/trpc/core";

export const requirePermission = (permissionName: string) =>
  t.middleware(({ ctx, next }) => {
    const user = ctx.sessionClient?.user;

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      });
    }

    const permissions = user.role?.permissions ?? [];
    const hasPermission = permissions.includes(permissionName);

    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing permission: ${permissionName}`,
      });
    }

    return next();
  });

export const isAdmin = t.middleware(({ ctx, next }) => {
  const user = ctx.sessionClient?.user;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }

  if (user.role?.name !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Administrator access required.",
    });
  }

  return next();
});