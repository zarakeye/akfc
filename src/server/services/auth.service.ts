// @server/services/auth.service.ts
import { prisma } from "@server/prisma";
import bcrypt from "bcryptjs";
import { createSessionJWT } from "@server/lib/session/session.server";
import type { UserEnhancedStrict } from "@/types";
import { Session } from "@prisma/client";
import { TRPCError } from "@trpc/server";

type loginServiceResult = {
  session: Session;
  token: string;
  userId: string;
};

export async function loginService(email: string, password: string): Promise<loginServiceResult> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    }
  });

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "INVALID_CREDENTIALS"
    });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "INVALID_CREDENTIALS"
    });
  }

  const normalizedUser: UserEnhancedStrict = {
    ...user,
    role: user.role
      ? {
          ...user.role,
          permissions: user.role.permissions.map((p) => p.permission),
        }
      : null,
  };
  
  const { session, token } = await createSessionJWT(normalizedUser);

  return {
    session,
    token,
    userId: user.id,
  };
}
