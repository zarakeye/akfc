import 'server-only';
import { prisma } from '@server/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Role, User, Session, Permission } from '@prisma/client';
import { COOKIE_NAME, SESSION_DURATION_MS } from '../constants';
import type { UserEnhancedStrict } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET;

export async function createSessionJWT(user: UserEnhancedStrict): Promise<{ user: UserEnhancedStrict; session: Session }> {
  const sessionToken = crypto.randomUUID();
  
  // Set the token to expire in 7 days
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Create the session
  const session = await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      role: user.role?.name ?? null,
      expiresAt
    }
  });

  console.log('🔑 SESSION CREATED:', session);
  // Create the JWT
  const jwtToken = jwt.sign(
    {
      sessionId: session.id,
      userId: user.id,
    },
    JWT_SECRET ?? '',
    {
      expiresIn: "7d"
    }
  );

  const cookiestore = await cookies();
  console.log('🍪 COOKIE is SETTING:', jwtToken);
  cookiestore.set(COOKIE_NAME, jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax', // "strict",
    expires: expiresAt,
    path: '/'
  });

  const testCookie = cookiestore.get(COOKIE_NAME)?.value;
  console.log('🍪 COOKIE SET:', testCookie);

  console.log("CTX USER:", JSON.stringify(user, null, 2));

  return { user, session };
}

export async function deleteSession() {
  const cookiestore = await cookies();
  const cookie = cookiestore.get(COOKIE_NAME);

  if (!cookie) return null;

  try {
    const payload = jwt.verify(cookie.value, JWT_SECRET!) as { sessionId: string; };
    await prisma.session.delete({ where: { id: payload.sessionId } });
  } catch (err) {
    console.error("deleteSession error:", err);
  }
  cookiestore.delete(COOKIE_NAME);
}

export async function getUserFromSessionJWT(): Promise<(User & { role: (Role & { permissions: Permission[]; }) | null }) | null> {
  // Get the cookie
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

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
        token: newJwt,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS)
      }
    });

    return updatedSession;
  } catch (error) {
    console.error("Error refreshing session JWT:", error);
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
