import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { prisma } from "packages/backend/src/prisma";
import { COOKIE_NAME } from "packages/contracts/src/auth/constants";
import type { Permission, Role, Session, User } from "@prisma/client";
import type { SessionClient } from "packages/contracts/src/auth/session.types";

/**
 * getSessionFromRequest.ts
 *
 * Objectif:
 * - Fournir une fonction unique et stable pour récupérer la session
 * - Compatible App Router (cookies() de next/headers)
 * - Compatible handlers (Request/NextRequest) via req.headers.get("cookie")
 *
 * Important:
 * - Pas besoin d'utiliser req si on est dans un contexte Next "request-bound",
 *   mais on le supporte pour les contextes où cookies() n'est pas accessible.
 */

type SessionDB = Session & {
  user: (User & {
    role: (Role & {
      permissions: {
        permission: Permission;
      }[];
    }) | null;
  }) | null;
};

/**
 * Maps a SessionDB object to a SessionClient object.
 *
 * If the SessionDB object is null or has no user, returns a SessionClient object with a null user.
 *
 * Otherwise, returns a SessionClient object with the user's information and role details.
 *
 * @param {SessionDB | null} session - The SessionDB object to map.
 * @returns {SessionClient} - The mapped SessionClient object.
 */
function mapSessionDBToSessionClient(session: SessionDB | null): SessionClient {
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
            permissions: role.permissions.map((rp) => rp.permission.name),
          }
        : null,
    },
  };
}

/**
 * Parse a simple cookie header.
 *
 * @param {string | null} cookieHeader - The raw cookie header string.
 * @param {string} name - The name of the cookie to search for.
 * @returns {string | null} - The value of the cookie if found, or null otherwise.
 */
function getCookieFromHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  // cookieHeader: "a=b; c=d; token=xyz"
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

/**
 * Récupère le token cookie soit via req.headers, soit via cookies() Next.
 * Fallback sur cookies() si req est null.
 * Retourne le token cookie si disponible, null sinon.
 * @param {Request | null} [req] - La requête Next.
 * @returns {Promise<string | null>} - Le token cookie si disponible, null sinon.
 */
async function readAuthToken(req?: Request): Promise<string | null> {
  // 1) si on a req => on lit le header cookie (marchera partout)
  if (req) {
    const token = getCookieFromHeader(req.headers.get("cookie"), COOKIE_NAME);
    if (token) return token;
  }

  // 2) fallback App Router: cookies() (peut throw si hors request context)
  try {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Récupère la session en cours associée à la requête.
 * Si le token cookie est absent ou invalide, renvoie null.
 * Sinon, récupère la session en cours et renvoie les informations de la session.
 *
 * @param {Request | null} [req] - La requête Next.
 * @returns {Promise<SessionClient | null>} - La session en cours si disponible, null sinon.
 */
export async function getSessionFromRequest(req?: Request): Promise<SessionClient | null> {
  const token = await readAuthToken(req);

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
              },
            },
          },
        },
      },
    },
  });

  if (!sessionDB) return null;

  if (sessionDB.expiresAt < new Date()) return null;

  return mapSessionDBToSessionClient(sessionDB);
}