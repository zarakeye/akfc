'use server';

import { prisma } from "@server/prisma";
import { createPermissionFormSchema } from "../schemas/createPermissionForm.schema";

export type CreatePermissionFormState = {
  success: boolean;
  error?: string;
}

// 🧩 Action Server
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