'use server';
// export const runtime = 'nodejs';

import { prisma } from "@server/prisma";
import { createPermissionSchema } from "@/server/validation/createPermission.schema";
import type { CreatePermissionState } from "@server/actions/actionState.interfaces";

// 🧩 Action Server
export const createPermissionAction = async (
  prevState: CreatePermissionState,
  formData: FormData
): Promise<CreatePermissionState> => {
  // ✅ Validation Zod côté serveur
  const result = createPermissionSchema.safeParse({
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