'use server';

import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";
import { authSchema } from "@server/validation/auth.schema";
import type { AuthState } from "@server/actions/actionState.interfaces";
import { createSessionJWT } from "@/lib/session/session.server";
import { UserEnhancedStrict } from "@/types";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import jwt from "jsonwebtoken";


// export type UserWithRole = (User & { role: (Role & { permissions: Permission[] }) | null }) | null;
// export type SessionWithUser = (Session & { user: User & { role: (Role & { permissions: Permission[] }) | null } }) | null;

/**
 * AuthAction is a server action that handles the authentication of a user.
 * It takes an object with email and password properties and returns a promise that resolves to an object with success, errors and credentials properties.
 * If the email and password are correct, it creates a session cookie and returns an object with success set to true.
 * If the email and password are incorrect, it returns an object with success set to false and an errors object with an error message for the email and password.
 * If an error occurs during the authentication process, it returns an object with success set to false and an errors object with an error message for the email.
 */
export const AuthAction = async (
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> => {
  console.log('AuthAction called');
  console.log("FORMDATA", Array.from(formData.entries()));

  
  // ✅ Validation Zod côté serveur
  const result = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
      user: null,
    };
  }

  try {
    // ✅ Insertion Prisma
    const user = await prisma.user.findUnique({
      where: {
        email: result.data.email,
      },
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
    });

    if (!user) {
      return {
        success: false,
        error: "This user does not exist",
        user: null
      };
    }

    const valid = await bcrypt.compare(result.data.password, user.password);

    if (!valid) {
      console.log('Password is incorrect');
      return {
        success: false,
        error: "Password is incorrect",
        user: null
      };
    }

    const normalizedUser = {
      ...user,
      role: user.role ? {
        ...user.role,
        permissions: user.role?.permissions.map(p => p.permission)
      } : null
    } as UserEnhancedStrict;


    const { session } = await createSessionJWT(normalizedUser);

    return { success: true, session, user: normalizedUser };
  } catch {
    return {
      success: false,
      error: "Something went wrong" ,
      user: null
    };
  }
}

export async function getSessionAction(){
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const JWT_SECRET = process.env.JWT_SECRET;
  
  try {
    // 🔑 Verify the JWT
    const payload = jwt.verify(
      token,
      JWT_SECRET ?? "",
    ) as { sessionId: string;/* userId: string*/ };

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

    if (!session || session.expiresAt < new Date()) return null;

    // ⭐ NORMALISATION OBLIGATOIRE
    const normalizedSession = {
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