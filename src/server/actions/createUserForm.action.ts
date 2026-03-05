'use server';
// export const runtime = 'nodejs';

import { getUserFromSessionJWT } from "@server/lib/session/session.server";
import bcrypt from "bcryptjs";
import generateStrongPassword from "@/lib/generatePassword";
import sendPasswordEmail from "@/server/welcomeEmailWithPassword";
import { prisma } from "@server/prisma";
import { createUserFormSchema } from "@/server/schemas/createUserForm.schema";

export interface CreateUserFormState {
  success: boolean;
  error?: string;
}

/**
 * 🧩 Action Server
 * Creates a new user with the given email and role id.
 * 
 * @param prevState - The current state of the action.
 * @param formData - The form data containing the email and role id.
 * @returns A promise that resolves to an object with a success property and an error property.
 * If the creation is successful, success is true and error is an empty object.
 * If the creation fails, success is false and error is an object with a message property.
 */
export const createUserAction = async (
  prevState: CreateUserFormState,
  formData: FormData 
): Promise<CreateUserFormState> => {
  // ✅ Validation Zod coté serveur
  const result = createUserFormSchema.safeParse({
    email: formData.get('email'),
    roleId: Number(formData.get('roleId')),
    // password: formData.get('password'),
  });

  console.log("createUserAction called with formData:", formData);
  console.log("Result:", result);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    }
  }

  try {
    const me = await getUserFromSessionJWT();

    // ❌ Vérifie que l’email n’est pas celui du user connecté
    if (me?.email === result.data.email) {
      return {
        success: false,
        error: "Vous ne pouvez pas créer un compte avec votre propre email",
      };
    };

    // ❌ Vérifie que l’email n’est pas celui d’un autre utilisateur
    const existingUser = await prisma.user.findUnique({
      where: { email: result.data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Un compte avec cette adresse email existe déjà",
      };
    }

    // ✅ Création du mot de passe temporaire
    const password = generateStrongPassword();
    const hash = await bcrypt.hash(password, 12);

    // ✅ Création de l’utilisateur
    const createdUser = async (): Promise<boolean> => {
      const userCreated = await prisma.user.create({
        data: {
          email: result.data.email,
          roleId: result.data.roleId,
          password: hash,
          firstName: '',
          lastName: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          pseudo: '',
          phone: '',
          birthDate: null,
          memberSince: null,
          aboutMe: '',
          avatar: '',
        },
      });

      if (userCreated) {
        return true;
      }
      return false;
    };

    const userCreationResult = await createdUser();
    console.log("User creation result:", userCreationResult);

    // ✅ Envoi du mail de bienvenue avec le mot de passe
    if (userCreationResult) await sendPasswordEmail(result.data.email, `Bienvenue à l'${process.env.APP_SHORT_NAME}, ${process.env.APP_FULL_NAME}`, password);

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: "Error creating user",
    };
  } 
};