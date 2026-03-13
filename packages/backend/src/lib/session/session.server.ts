// lib/session/session.server.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "packages/backend/src/prisma";
import { COOKIE_NAME, SESSION_DURATION_MS } from "packages/contracts/src/auth/constants";
import { UserEnhancedStrict } from "packages/backend/src/types/prisma-extended.types";
import { Permission, Role, Session, User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;

type CreateSessionResult = {
  sessionId: Session['id'];
}

/**
 * Creates a new session for the user and returns the session id.
 * The session is stored in the database and a JWT token is generated.
 * The JWT token is set to expire in 7 days and is stored in a cookie.
 * @param {UserEnhancedStrict} user - The user to create a session for
 * @returns {Promise<CreateSessionResult>} - A promise resolving to an object containing the session id
 */
export async function createSessionJWT(user: UserEnhancedStrict): Promise<CreateSessionResult> {
  // Set the token to expire in 7 days
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  
  // 1️⃣ DB session
  const session = await prisma.session.create({
    data: {
      // token: crypto.randomUUID(),
      userId: user.id,
      role: user.role?.name ?? null,
      expiresAt
    }
  });

  // 2️⃣ JWT
  const token = jwt.sign(
    {
      sessionId: session.id,
      // userId: user.id,
    },
    JWT_SECRET!,
    {
      expiresIn: '7d',
    }
  );


  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return {
    sessionId: session.id,
  };
}

/**
 * Deletes the session associated with the given cookie, and then deletes the cookie.
 * If the cookie is not present, the function does nothing.
 * @returns {Promise<void>} - A promise resolving when the session has been deleted and the cookie has been removed.
 */
export async function deleteSessionFromCookie() {
  const cookiestore = await cookies();
  const token = cookiestore.get(COOKIE_NAME)?.value;

  if (!token) return;

  try {
    const payload = jwt.verify(token, JWT_SECRET!) as { sessionId: string; };
    
    await prisma.session.delete({
      where: { id: payload.sessionId }
    });
  } catch (err) {
    console.error("deleteSession error:", err);
  } 
  
  cookiestore.delete(COOKIE_NAME);
}

/**
 * Retrieves the user associated with the session from the cookie.
 * If the cookie is not present, or the session is invalid/expired, returns null.
 * @returns {Promise<(User & { role: (Role & { permissions: Permission[]; }) | null> | null>} - A promise resolving to the user, including their role and permissions.
 */
export async function getUserFromSessionJWT(): Promise<(User & { role: (Role & { permissions: Permission[]; }) | null }) | null> {
  // Get the cookie
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  console.log("🍪 COOKIE:", cookie);

  if (!cookie) return null;

  try {
    // Verify the JWT
    const payload = jwt.verify(cookie.value, JWT_SECRET ?? '') as {
      sessionId: string;
      userId: string;
      // token: string
    };
    console.log("PAYLOAD:", payload);

    const session = await prisma.session.findUnique({
      where: {
        id: payload.sessionId
        // token: payload.token
      },
      include: {
        user: {
          include: { role: { include : { permissions: { include: { permission: true } } } } } }
        }
      });

    if (!session || session.expiresAt < new Date()) return null;

    if (!session.user.role) throw new Error("User role missing !");

    return {
      ...session.user,
      role: session.user.role ? {
        ...session.user.role,
        permissions: session.user.role.permissions.map(p => p.permission)
      } : null
    }
  } catch {
    return null;
  }
}

/**
 * Refresh the session JWT with the new information.
 * @param {Session} session - The session to refresh.
 * @param {User} user - The user associated with the session.
 * @returns {Promise<Session | null>} - The updated session or null if an error occurs.
 */
export async function refreshSessionJWT(session: Session, user: User) {
  // Regénérer un nouveau JWT avec les nouvelles infos
  const newJwt = jwt.sign(
    {
      sessionId: session.id, // ou session.id selon ton schema réel
      userId: user.id,
      isFirstLogin: user.isFirstLogin
    },
    JWT_SECRET!,
    { expiresIn: "7d" }
  );

  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, newJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // reprends l'expiration précédente !
      expires: new Date(Date.now() + SESSION_DURATION_MS)
    });

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS)
      }
    });

    return updatedSession;
  } catch (error) {
    console.error("Error refreshing session JWT:", error);
    return null;
  }
}

/**
 * Retrieves the JWT token from the cookie store.
 * If the cookie is not present, returns null.
 * @returns {Promise<string | null>} - The JWT token if present, null otherwise.
 */
export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  return token ?? null;
}

/**
 * Verifies the given JWT token and returns the decoded payload if successful,
 * or null if the token is invalid or missing.
 * @param {string | null} token - The JWT token to verify.
 * @returns {{ sub: string } | null} - The decoded payload if successful, null otherwise.
 */
export function verifyJwt(token: string | null): { sub: string } | null {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET!) as { sub: string };
  } catch {
    return null;
  }
}
