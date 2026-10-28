import { cookies } from "next/headers";

import { prisma } from "@backend/prisma";
import { COOKIE_NAME } from "@contracts/auth/constants";
import type { Prisma } from "@prisma/client";
import type { SessionClient } from "@contracts/auth/session.types";
import { verifyJwt } from "@backend/lib/session/session.server";

/**
 * Ce que la lecture d'une session ramène, et rien d'autre : la session, les champs du membre qui
 * partent vers le navigateur, et son appartenance au groupe Administrateurs (au plus une ligne).
 * Avec relationJoins (schema.prisma), Prisma lit le tout en UNE requête SQL.
 */
const sessionSelect = {
  id: true,
  expiresAt: true,
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      pseudo: true,
      avatar: true,
      isFirstLogin: true,
      memberGroupMemberships: {
        where: { group: { isAdminGroup: true } },
        select: { id: true },
        take: 1,
      },
    },
  },
} satisfies Prisma.SessionSelect;

/** Une session lue avec son membre : type GÉNÉRÉ par Prisma à partir de la sélection elle-même. */
type SessionDB = Prisma.SessionGetPayload<{ select: typeof sessionSelect }>;

/** De la ligne lue en base au contrat partagé avec le front : champ par champ, jamais la ligne entière. */
function mapSessionDBToSessionClient(session: SessionDB): SessionClient {
  const { memberGroupMemberships, ...user } = session.user;
  return {
    expiresAt: session.expiresAt,
    user: {
      ...user,
      // Source de vérité « admin » : l'appartenance au groupe Administrateurs (isAdminGroup).
      // Aucun champ de User ne le dit : le droit se lit dans les relations.
      isAdmin: memberGroupMemberships.length > 0,
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
  const payload = verifyJwt(await readAuthToken(req));
  if (!payload) return null;

  const sessionDB = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    select: sessionSelect,
  });

  if (!sessionDB) return null;

  if (sessionDB.expiresAt < new Date()) {
    await prisma.session.deleteMany({
      where: { id: sessionDB.id },
    });

    return null;
  }

  return mapSessionDBToSessionClient(sessionDB);
}
