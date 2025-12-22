import { t } from "@server/trpc/core";
import { TRPCError } from "@trpc/server";

export const requirePermission = (permissionName: string) => 
  t.middleware(({ ctx, next }) => {
    const permissions = ctx.session?.user?.role?.permissions?.map((p: { name: string; }) => p.name) ?? [];
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
