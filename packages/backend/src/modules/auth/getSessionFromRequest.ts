import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { prisma } from "@backend/prisma";
import { COOKIE_NAME } from "@contracts/auth/constants";
import type { Permission, Role, Session, User } from "@prisma/client";
import type { SessionClient } from "@contracts/auth/session.types";

const JWT_SECRET = process.env.JWT_SECRET;

type SessionJwtPayload = {
  sessionId: Session["id"];
};

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
  const role = session.user!.role;

  return {
    expiresAt: session.expiresAt,
    user: {
      id: session.user!.id,
      email: session.user!.email,
      firstName: session.user!.firstName,
      lastName: session.user!.lastName,
      pseudo: session.user!.pseudo,
      avatar: session.user!.avatar,
      isFirstLogin: session.user!.isFirstLogin,
      role: role
        ? {
            id: role.id,
            name: role.name,
            permissions: role.permissions.map((rp) => rp.permission.name),
          }
        : null,
    },
  };
}

function getCookieFromHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";").map((p) => p.trim());

  for (const p of parts) {
    if (!p) continue;

    const eq = p.indexOf("=");
    if (eq === -1) continue;

    const k = p.slice(0, eq).trim();
    const v = p.slice(eq + 1).trim();

    if (k === name) return decodeURIComponent(v);
  }

  return null;
}

async function readAuthToken(req?: Request): Promise<string | null> {
  if (req) {
    const token = getCookieFromHeader(req.headers.get("cookie"), COOKIE_NAME);
    if (token) return token;
  }

  try {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req?: Request): Promise<SessionClient | null> {
  const token = await readAuthToken(req);

  if (!token) return null;
  if (!JWT_SECRET) return null;

  let payload: SessionJwtPayload;

  try {
    payload = jwt.verify(token, JWT_SECRET) as SessionJwtPayload;
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
              },
            },
          },
        },
      },
    },
  });

  if (!sessionDB) return null;

  if (sessionDB.expiresAt < new Date()) {
    await prisma.session.deleteMany({
      where: { id: sessionDB.id },
    });

    return null;
  }

  if (!sessionDB.user) {
    return null;
  }

  return mapSessionDBToSessionClient(sessionDB);
}