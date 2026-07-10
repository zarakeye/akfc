'use server';

import { prisma } from "@backend/prisma";
import { saveRoleFormSchema } from "@contracts/forms/saveRoleForm.schema";

export type SaveRoleFormState = {
  success: boolean;
  error?: string;
  roleId?: number;
};

export const saveRoleFormAction = async (
  prevState: SaveRoleFormState,
  formData: FormData,
): Promise<SaveRoleFormState> => {
  const parsed = saveRoleFormSchema.safeParse({
    id: formData.get("id") ?? undefined,
    name: formData.get("name")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, name } = parsed.data;

  // Permissions — input caché JSON (tableau d'ids), parsé à part.
  const rawPerms = formData.get("permissionIds");
  let permissionIds: number[] = [];
  try {
    const arr = rawPerms ? JSON.parse(String(rawPerms)) : [];
    permissionIds = Array.isArray(arr)
      ? arr.filter((n): n is number => Number.isInteger(n))
      : [];
  } catch {
    return { success: false, error: "Format des permissions invalide." };
  }

  // Conflit d'unicité sur le nom — on s'exclut soi-même en édition.
  const existing = await prisma.role.findUnique({
    where: { name },
    select: { id: true },
  });
  if (existing && existing.id !== id) {
    return {
      success: false,
      error:
        id === undefined
          ? "Ce rôle existe déjà."
          : "Un autre rôle porte déjà ce nom.",
    };
  }

  try {
    if (id === undefined) {
      const created = await prisma.role.create({
        data: {
          name,
          permissions:
            permissionIds.length > 0
              ? { create: permissionIds.map((permissionId) => ({ permissionId })) }
              : undefined,
        },
      });
      return { success: true, roleId: created.id };
    }

    // Édition : remplacement RÉEL du jeu de permissions.
    // `deleteMany: {}` (scopé à la relation = ce rôle) + `create` — surtout
    // PAS `set`, qui ne connecte que des lignes de jointure existantes et
    // n'ajoute jamais une liaison absente (le bug rôles qu'on a corrigé).
    const updated = await prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: {
          deleteMany: {},
          create: permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
    });
    return { success: true, roleId: updated.id };
  } catch {
    return { success: false, error: "Enregistrement impossible." };
  }
};