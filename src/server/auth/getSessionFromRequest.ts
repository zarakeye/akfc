import { cookies } from "next/headers";
import { prisma } from "@server/prisma";
import { Permission, Role, Session, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@lib/constants";
import { SessionClient } from "@/types/session.types";

type SessionDB = Session & {
  user: (User & {
    role: (Role & {
      permissions: {
        permission: Permission;
      }[];
    }) | null;
  }) | null;
};

function mapSessionDBToSessionClient(session: SessionDB): SessionClient {

  if (!session || !session.user) {
    return {
      expiresAt: session?.expiresAt ?? new Date(),
      user: null,
    };
  }

  const role = session.user.role;

  return {
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      pseudo: session.user.pseudo,
      avatar: session.user.avatar,
      isFirstLogin: session.user.isFirstLogin,
      role: role
        ? {
            id: role.id,
            name: role.name,
            permissions: role.permissions.map(
              rp => rp.permission.name
            ),
          }
        : null,
      },
    };
  }

export async function getSessionFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  let payload: { sessionId: string }; 

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as { sessionId: string };
  } catch {
    return null;
  }

  const sessionDB = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              }
            },
          }
        }
      }
    },
  });

  if (!sessionDB) return null;

  if (sessionDB.expiresAt < new Date()) return null;

  return mapSessionDBToSessionClient(sessionDB);
}