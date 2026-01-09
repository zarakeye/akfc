'use server';

import { prisma } from "@/server/prisma";
import { authSchema } from "@server/validation/auth.schema";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import jwt from "jsonwebtoken";
import { loginService } from "../services/auth.service";
import { Session } from "@prisma/client";
import { SessionEnhanced } from "@/types";
import { redirect } from "next/navigation";

export interface AuthState {
  success: boolean;
  error?: string;
  // session?: Session;
}

/**
 * AuthAction is a server action that handles the authentication of a user.
 * It takes an object with email and password properties and returns a promise that resolves to an object with success, errors and credentials properties.
 * If the email and password are correct, it creates a session cookie and returns an object with success set to true.
 * If the email and password are incorrect, it returns an object with success set to false and an errors object with an error message for the email and password.
 * If an error occurs during the authentication process, it returns an object with success set to false and an errors object with an error message for the email.
 */
export const AuthAction = async (
  _: AuthState,
  formData: FormData
): Promise<AuthState> => {
  // ✅ Validation Zod côté serveur
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  try {
    await loginService(parsed.data.email, parsed.data.password);
    
    redirect("/");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Something went wrong" ,
    };
  }
}

export async function getSessionAction(): Promise<SessionEnhanced | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const JWT_SECRET = process.env.JWT_SECRET;
  
  try {
    // 🔑 Verify the JWT
    const payload = jwt.verify(
      token,
      JWT_SECRET ?? "",
    ) as { sessionId: string;};

    if (!payload) return null;

    // Find the session in the database via the 'token' property
    const session = await prisma.session.findUnique({
      where: {
        id: payload.sessionId
        // token
      },
      // include: { user: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      include: {
        user: {
          include: { role: { include : { permissions: { include: { permission: true } } } } }
        }
      },
    });

    if (!session) return null;

    // ✅ Si la session est expirée, on la supprime
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    // ⭐ NORMALISATION OBLIGATOIRE
    const normalizedSession: SessionEnhanced = {
      ...session,
      user: {
        ...session.user,
        role: session.user.role
          ? {
              ...session.user.role,
              permissions: session.user.role.permissions.map(p => p.permission)
            }
          : null
      }
    };

    console.log("SESSION ACTION:", normalizedSession);

    return normalizedSession;
  } catch (error) {
    console.error("getSessionAction error", error);
    return null;
  }
} 