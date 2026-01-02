'use server';
// export const runtime = 'nodejs';

import { prisma } from "@/server/prisma";
import { updateRoleFormSchema } from "@/server/schemas/updateRoleForm.schema";

export interface UpdateRoleFormState {
  success: boolean;
  error?: string;
}

// 🧩 Action Server
export const updateRoleFormAction = async (
  prevState: UpdateRoleFormState,
  formData: FormData
): Promise<UpdateRoleFormState> => {
  console.log("UpdateRoleAction called with formData:", formData);
  
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
  
  // ✅ Validation Zod coté serveur
  const result = updateRoleFormSchema.safeParse({
    id: Number(formData.get('id')),
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
    console.log("Updating role with:", {
      name: result.data.name,
      description: result.data.description,
      permissions: result.data.permissions.map((id) => ({ permissionId: id })),
    });

    // ✅ Insertion Prisma
    await prisma.role.update({
      where: { id: result.data.id },
      data: {
        name: result.data.name,
        permissions: {
          set: result.data.permissions.map((id) => ({
            roleId_permissionId: { roleId: result.data.id, permissionId: id },
          })),
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