import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@workspace/backend/prisma";
import { COOKIE_NAME, SESSION_DURATION_MS } from "@workspace/contracts/src/auth/constants";
import { UserEnhancedStrict } from "@workspace/backend/types/prisma-extended.types";
import { Session } from "@prisma/client";
import type { SessionJwtPayload } from "@workspace/backend/lib/session/session.types";

const JWT_SECRET = process.env.JWT_SECRET;

type CreateSessionResult = {
  sessionId: Session["id"];
};

export async function createSessionJWT(user: UserEnhancedStrict): Promise<CreateSessionResult> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt,
    },
  });

  const payload: SessionJwtPayload = {
    sessionId: session.id,
  };

  const token = jwt.sign(payload, JWT_SECRET!, {
    expiresIn: "7d",
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

export async function deleteSessionFromCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return;

  try {
    const payload = jwt.verify(token, JWT_SECRET!) as SessionJwtPayload;

    await prisma.session.deleteMany({
      where: { id: payload.sessionId },
    });
  } catch (err) {
    console.error("deleteSession error:", err);
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export function verifyJwt(token: string | null): SessionJwtPayload | null {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET!) as SessionJwtPayload;
  } catch {
    return null;
  }
}