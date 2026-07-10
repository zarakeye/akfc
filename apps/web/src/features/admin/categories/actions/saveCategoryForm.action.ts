'use server';

import { prisma } from "@backend/prisma";
import { saveCategoryFormSchema } from "@contracts/forms/saveCategoryForm.schema";

export type SaveCategoryFormState = {
  success: boolean;
  error?: string;
  /** Id de la catégorie upsertée — nouvel id en création, même id en édition. */
  categoryId?: number;
};

/**
 * 🧩 Action unique create + update. S'adapte sur la présence d'`id` :
 *   - absent  → création (refus si le type existe déjà) ;
 *   - présent → mise à jour (refus si un AUTRE enregistrement porte ce type).
 */
export const saveCategoryFormAction = async (
  prevState: SaveCategoryFormState,
  formData: FormData,
): Promise<SaveCategoryFormState> => {
  // `id` absent en création → formData.get renvoie null → undefined → optional.
  const parsed = saveCategoryFormSchema.safeParse({
    id: formData.get("id") ?? undefined,
    type: formData.get("type")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, type } = parsed.data;

  // Conflit d'unicité — on exclut soi-même en édition.
  const existing = await prisma.category.findUnique({ where: { type } });
  if (existing && existing.id !== id) {
    return {
      success: false,
      error:
        id === undefined
          ? "Cette catégorie existe déjà."
          : "Une autre catégorie porte déjà ce type.",
    };
  }

  try {
    if (id === undefined) {
      const created = await prisma.category.create({ data: { type } });
      return { success: true, categoryId: created.id };
    }
    const updated = await prisma.category.update({
      where: { id },
      data: { type },
    });
    return { success: true, categoryId: updated.id };
  } catch {
    return { success: false, error: "Enregistrement impossible." };
  }
};