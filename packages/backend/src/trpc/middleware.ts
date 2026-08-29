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

    // Auth collapsée sur le groupe Administrateurs : toute permission ⇒
    // réservé aux admins (source unique user.isAdmin). Signature conservée →
    // les sites d'appel `requirePermission(...)` ne changent pas.
    if (!user.isAdmin) {
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

  if (!user.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Administrator access required.",
    });
  }

  return next();
});