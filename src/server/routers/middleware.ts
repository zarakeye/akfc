import { t } from "@server/trpc/core";
import { TRPCError } from "@trpc/server";

/**
 * Require a specific permission for a route.
 * If the user does not have the permission, a TRPCError with code "FORBIDDEN" will be thrown.
 * @param {string} permissionName - The name of the permission to require.
 * @returns {t.Middleware} - A middleware that checks if the user has the required permission.
 */
export const requirePermission = (permissionName: string) => 
  t.middleware(({ ctx, next }) => {
    const permissions = ctx.sessionClient?.user?.role?.permissions?.map(p => p) ?? [];
    const hasPermission = permissions.some((p) => p === permissionName);
    console.log("hasPermission", hasPermission);
    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `FORBIDDEN: Missing permission ${permissionName}`
      });
    }

    return next();
  })

export const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.sessionClient?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "UNAUTHORIZED: You are not authenticated !"
    });
  }

  return next();
});

export const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.sessionClient?.user?.role?.name !== "ADMIN" ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "UNAUTHORIZED: You must be an admin to access this !"
    });
  }

  return next();
});
