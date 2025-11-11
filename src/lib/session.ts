// Hybrid Session

import 'server-only';
import { prisma } from '@server/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Role, User } from '@/generated/prisma/client';
import { COOKIE_NAME, SESSION_DURATION_MS } from './constants';

const JWT_SECRET = process.env.JWT_SECRET;

interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Creates a new session and returns the session object.
 * The session is created with a random token, the user ID, and an expiration date 7 days from now.
 * The session is then stored in a JWT, which is stored in a secure cookie.
 * @param {string} userId - The ID of the user to create the session for.
 * @returns {Promise<Session>} - The created session object.
 */
export async function createSessionJWT(userId: string): Promise<Session> {
  // Generate a random token
  const token = crypto.randomUUID();
  
  // Set the token to expire in 7 days
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Create the session
  const session = await prisma.session.create({
    data: { token, userId, expiresAt }
  });

  // Create the JWT
  const jwtToken = jwt.sign({ sessionId: session.id, userId }, JWT_SECRET ?? '', {
    expiresIn: "7d"
  });

  // Set the cookie
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, jwtToken, {
    httpOnly: true,
    secure: true, // process.env.NODE_ENV === "production",
    sameSite: 'lax', // "strict",
    expires: expiresAt,
    path: '/'
  });

  return session;
}

/**
 * Deletes a session by its ID, or by the value of the secure cookie named __session if no ID is provided.
 * If the session is found, it is deleted from the database and the cookie is deleted from the browser.
 * If the session is not found, or if no cookie is present, the function does nothing.
 * @param {string} [sessionId] - The ID of the session to delete. If not provided, the function will delete the session associated with the secure cookie named __session.
 */
export async function deleteSession(sessionId?: string) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie) return null;

  await prisma.session.delete({
    where: sessionId ? { id: sessionId } : { token: cookie!.value }
  });

  cookieStore.delete(COOKIE_NAME);
}

/**
 * Retrieves the user associated with the current session cookie.
 * If the session cookie is not present, or if the session has expired, the function returns null.
 * @returns {Promise<User | null>} - The user associated with the session cookie, or null if the session cookie is not present or has expired.
 */
export async function getUserFromSessionJWT(): Promise<User | null> {
  // Get the cookie
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie) return null;

  try {
    // Verify the JWT
    const payload = jwt.verify(cookie.value, JWT_SECRET ?? '') as { sessionId: string; userId: string };

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: { include: { role: true } } }
    });

    if (!session || session.expiresAt < new Date()) return null;

    if (!session.user.role) throw new Error("User role missing !");

    return session.user as User & { role: Role};
  } catch {
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ?? null;
}

export function verifyJwt(token: string | null): { sub: string } | null {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET!) as { sub: string };
  } catch {
    return null;
  }
}
