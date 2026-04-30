'use server';
// export const runtime = 'nodejs';

import { prisma } from "@backend/prisma";
import { createCategoryFormSchema } from "@contracts/forms/createCategoryForm.schema";
import { CreateCategoryState } from "@features/admin/categories/types/createCategoryState.types";

/**
 * 🧩 Action Server
 * Creates a new activity type with the given type.
 * 
 * @param {CreateCategoryState} prevState - The current state of the action.
 * @param {FormData} formData - The form data containing the type.
 * @returns {Promise<CreateCategoryState>} A promise that resolves to an object with a success property and an error property.
 * If the creation is successful, success is true and error is an empty object.
 * If the creation fails, success is false and error is an object with a message property.
 */
export const createCategoryAction = async (
  prevState: CreateCategoryState,
  formData: FormData
): Promise<CreateCategoryState> => {
  // ✅ Validation Zod côté serveur
  const result = createCategoryFormSchema.safeParse({
    type: formData.get('type'),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    // ✅ Insertion Prisma
    await prisma.category.create({
      data: {
        type: result.data.name,
      },
    });

    return {
      success: true,
    };
  } catch {
    // ✅ Gestion d’erreurs
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la catégorie.",
    };
  }
}