'use server';

import { prisma } from "@backend/prisma";
import { savePermissionFormSchema } from "@contracts/forms/savePermissionForm.schema";

export type SavePermissionFormState = {
  success: boolean;
  error?: string;
  permissionId?: number;
};

/** Action upsert : bascule create/update sur la présence d'`id`. */
export const savePermissionFormAction = async (
  prevState: SavePermissionFormState,
  formData: FormData,
): Promise<SavePermissionFormState> => {
  const parsed = savePermissionFormSchema.safeParse({
    id: formData.get("id") ?? undefined,
    name: formData.get("name")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, name } = parsed.data;

  const existing = await prisma.permission.findUnique({ where: { name } });
  if (existing && existing.id !== id) {
    return {
      success: false,
      error:
        id === undefined
          ? "Cette permission existe déjà."
          : "Une autre permission porte déjà ce nom.",
    };
  }

  try {
    if (id === undefined) {
      const created = await prisma.permission.create({ data: { name } });
      return { success: true, permissionId: created.id };
    }
    const updated = await prisma.permission.update({
      where: { id },
      data: { name },
    });
    return { success: true, permissionId: updated.id };
  } catch {
    return { success: false, error: "Enregistrement impossible." };
  }
};