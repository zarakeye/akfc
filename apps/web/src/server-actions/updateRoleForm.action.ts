'use server';
// export const runtime = 'nodejs';

import { prisma } from "packages/backend/src/prisma";
import { updateRoleFormSchema } from "packages/contracts/schemas/forms/updateRoleForm.schema";

export interface UpdateRoleFormState {
  success: boolean;
  error?: string;
}

/**
 * 🧩 Action Server
 * Updates a role with the given form data.
 * 
 * Validation is done in two steps:
 * - First, the form data is validated against the `updateRoleFormSchema` using Zod.
 * - If the validation is successful, the role is updated in Prisma.
 * 
 * If any error occurs during the process, an error message is returned.
 * 
 * @param {UpdateRoleFormState} prevState - The current state of the action.
 * @param {FormData} formData - The form data containing the role details.
 * @returns {Promise<UpdateRoleFormState>} A promise that resolves to an object with a success property and an error property.
 * If the update is successful, success is true and error is an empty object.
 * If the update fails, success is false and error is an object with a message property.
 */
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