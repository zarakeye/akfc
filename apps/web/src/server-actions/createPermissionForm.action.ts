'use server';

import { prisma } from "packages/backend/src/prisma";
import { createPermissionFormSchema } from "../../../../packages/contracts/schemas/forms/createPermissionForm.schema";

export type CreatePermissionFormState = {
  success: boolean;
  error?: string;
}

/**
 * 🧩 Action Server
 * Creates a new permission with the given name.
 * 
 * @param {CreatePermissionFormState} prevState - The current state of the action.
 * @param {FormData} formData - The form data containing the name.
 * @returns {Promise<CreatePermissionFormState>} A promise that resolves to an object with a success property and an error property.
 * If the creation is successful, success is true and error is an empty object.
 * If the creation fails, success is false and error is an object with a message property.
 */
export const createPermissionFormAction = async (
  prevState: CreatePermissionFormState,
  formData: FormData
): Promise<CreatePermissionFormState> => {
  // ✅ Validation Zod côté serveur
  const result = createPermissionFormSchema.safeParse({
    name: formData.get('name'),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    // ✅ Insertion Prisma
    await prisma.permission.create({
      data: {
        name: result.data.name,
      },
    });

    return {
      success: true,
    };
  } catch {
    // ✅ Gestion d’erreurs
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la permission.",
    };
  }
}