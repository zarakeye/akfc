import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { prisma } from "@backend/prisma";
import { COOKIE_NAME } from "@contracts/auth/constants";
import type { Session, User } from "@prisma/client";
import type { SessionClient } from "@contracts/auth/session.types";

const JWT_SECRET = process.env.JWT_SECRET;

type SessionJwtPayload = {
  sessionId: Session["id"];
};

type SessionDB = Session & {
  user: User | null;
};

function mapSessionDBToSessionClient(
  session: SessionDB,
  isAdmin: boolean,
): SessionClient {
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
      isAdmin,
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
    // 🚀 Force Prisma à produire un JOIN SQL au lieu de N SELECT séquentiels.
    include: {
      user: true,
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

  // Source de vérité « admin » : appartenance au groupe Administrateurs
  // (isAdminGroup). Additif — remplacera le check sur le rôle (phases B/C).
  const isAdmin =
    (await prisma.memberGroupMembership.findFirst({
      where: { userId: sessionDB.user.id, group: { isAdminGroup: true } },
      select: { id: true },
    })) !== null;

  return mapSessionDBToSessionClient(sessionDB, isAdmin);
}