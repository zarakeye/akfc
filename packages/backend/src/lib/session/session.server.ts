import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@backend/prisma";
import { COOKIE_NAME, SESSION_DURATION_MS } from "@contracts/auth/constants";
import type { Session, User } from "@prisma/client";
import type { SessionJwtPayload } from "@backend/lib/session/session.types";

const JWT_SECRET = process.env.JWT_SECRET;

/** Seul algorithme accepté à la vérification : un jeton signé autrement est refusé. */
export const JWT_ALGORITHM = "HS256" as const;

type CreateSessionResult = {
  sessionId: Session["id"];
};

/**
 * Ouvre une session pour un membre : une ligne Session en base, un jeton signé qui ne contient
 * que l'identifiant de cette ligne, et un cookie qui transporte le jeton. Le jeton, la ligne et
 * le cookie expirent ensemble (SESSION_DURATION_MS).
 */
export async function createSessionJWT(userId: User["id"]): Promise<CreateSessionResult> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Dernière connexion, en SQL direct pour ne pas modifier updatedAt (dernière modification du profil).
  await prisma.$executeRaw`UPDATE "User" SET "lastLoginAt" = NOW() WHERE "id" = ${userId}`.catch((err: unknown) => {
    console.error("[session] lastLoginAt non mis à jour :", err instanceof Error ? err.message : err);
  });

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });

  const payload: SessionJwtPayload = {
    sessionId: session.id,
  };

  const token = jwt.sign(payload, JWT_SECRET!, {
    algorithm: JWT_ALGORITHM,
    expiresIn: Math.floor(SESSION_DURATION_MS / 1000),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return {
    sessionId: session.id,
  };
}

/** Déconnexion : supprime la ligne Session désignée par le cookie, puis le cookie. */
export async function deleteSessionFromCookie(): Promise<void> {
  const cookieStore = await cookies();
  const payload = verifyJwt(cookieStore.get(COOKIE_NAME)?.value ?? null);

  if (payload) {
    // Une base injoignable ne doit pas empêcher de retirer le cookie : le navigateur est
    // déconnecté quoi qu'il arrive, et la ligne expirera d'elle-même.
    await prisma.session.deleteMany({ where: { id: payload.sessionId } }).catch((err: unknown) => {
      console.error("[session] suppression à la déconnexion :", err instanceof Error ? err.message : err);
    });
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/** Le contenu du jeton si sa signature et sa date sont valides, sinon null. */
export function verifyJwt(token: string | null): SessionJwtPayload | null {
  if (!token || !JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] }) as SessionJwtPayload;
  } catch {
    return null;
  }
}
