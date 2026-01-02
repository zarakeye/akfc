'use server';
// export const runtime = 'nodejs';

import { prisma } from "@/server/prisma";
import { createRoleFormSchema } from "@/server/schemas/createRoleForm.schema";

export type CreateRoleFormState = {
  success: boolean;
  error?: string;
}

// 🧩 Action Server
export const createRoleFormAction = async (
  prevState: CreateRoleFormState,
  formData: FormData
): Promise<CreateRoleFormState> => {
  console.log("createRoleAction called with formData:", formData);
  
  const rawPermissions = formData.get('permissions') as string | null;

  console.log("Raw permissions:", rawPermissions);

  let permissionsArray: number[] = [];

  try {
    permissionsArray = rawPermissions
      ? JSON.parse(rawPermissions)
      : [];
    console.log("Parsed permissions array:", permissionsArray, "type:", typeof permissionsArray);
  } catch (error) {
    console.error("❌ Error parsing permissions:", error);
    return {
      success: false,
      error: "Invalid permissions format.",
    };
  }

  // ✅ Validation Zod côté serveur
  const result = createRoleFormSchema.safeParse({
    name: formData.get('name')?.toString().trim(),
    permissions: permissionsArray,
    description: formData.get('description')?.toString().trim(),
  });
  
  console.log("Validation result:", result);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    // ✅ Insertion Prisma
    await prisma.role.create({
      data: {
        name: result.data.name,
        permissions: {
          create: permissionsArray.map((id) => ({ permissionId: id })),
        },
        description: result.data.description,
      },
    });

    return {
      success: true,
    };
  } catch {
    // ✅ Gestion d’erreurs
    return {
      success: false,
      error: "Une erreur est survenue lors de la création du rôle.",
    };
  }
};