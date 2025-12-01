'use server';
// export const runtime = 'nodejs';

import { prisma } from "@/server/prisma";
import { createSessionJWT/*, getUserFromSessionJWT*/ } from "@/lib/session/session.server";
import bcrypt from "bcryptjs";
import { authSchema } from "@server/validation/auth.schema";
import type { AuthState } from "@server/actions/actionState.interfaces";

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
      };
    }

    const valid = await bcrypt.compare(result.data.password, user.password);

    if (!valid) {
      return {
        success: false,
        error: "Password is incorrect",
      };
    }

    await createSessionJWT(user);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Something went wrong" 
    };
  }
}