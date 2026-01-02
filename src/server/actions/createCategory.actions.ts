'use server';
// export const runtime = 'nodejs';

import { prisma } from "@server/prisma";
import { createCategoryFormSchema, type CreateCategoryFormSchema } from "@/server/schemas/createCategoryForm.schema";
import type { CreateActivityTypeState } from "@server/actions/actionState.interfaces";

export interface CreateCategoryState {
  success: boolean;
  error?: string;
}

// 🧩 Action Server
export const createActivityTypeAction = async (
  prevState: CreateActivityTypeState,
  formData: FormData
): Promise<CreateActivityTypeState> => {
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
        type: result.data.type,
      },
    });

    return {
      success: true,
    };
  } catch {
    // ✅ Gestion d’erreurs
    return {
      success: false,
      error: "Une erreur est survenue lors de la création du type d'activité.",
    };
  }
}