'use server';
// export const runtime = 'nodejs';

import { prisma } from "@server/prisma";
import { createActivityTypeSchema } from "@/app/entities/categories/[server]/create/createActivityType.schema";
import type { CreateActivityTypeState } from "@server/actions/actionState.interfaces";

// 🧩 Action Server
export const createActivityTypeAction = async (
  prevState: CreateActivityTypeState,
  formData: FormData
): Promise<CreateActivityTypeState> => {
  // ✅ Validation Zod côté serveur
  const result = createActivityTypeSchema.safeParse({
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
    await prisma.activityType.create({
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