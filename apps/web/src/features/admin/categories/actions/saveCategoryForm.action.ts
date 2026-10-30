'use server';

import { Prisma } from "@prisma/client";

import { prisma } from "@backend/prisma";
import { APP_ROOT } from "@config/app";
import { categoryFolderPath, newCategorySegment, setFolderLabel } from "@backend/modules/storage/storageSegments";
import { ADMIN_ONLY_MESSAGE, callerIsAdmin } from "@features/admin/common/actions/callerIsAdmin";
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
 *
 * Le dossier de la catégorie suit son segment de stockage, figé à la création : un
 * renommage ne change que le libellé affiché par le finder (FolderLabel).
 */
export const saveCategoryFormAction = async (
  prevState: SaveCategoryFormState,
  formData: FormData,
): Promise<SaveCategoryFormState> => {
  // Point d'accès public : les droits se vérifient ici, avant toute lecture du formulaire.
  if (!(await callerIsAdmin())) return { success: false, error: ADMIN_ONLY_MESSAGE };

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
    const saved = await prisma.$transaction(async (tx) => {
      const row =
        id === undefined
          ? await tx.category.create({
              data: { type, storageSegment: await newCategorySegment(tx, type) },
            })
          : await tx.category.update({ where: { id }, data: { type } });
      // Le finder affiche le libellé ; le dossier, lui, ne bouge pas.
      await setFolderLabel(tx, categoryFolderPath(APP_ROOT, row), row.type);
      return row;
    });
    return { success: true, categoryId: saved.id };
  } catch (err) {
    // Deux enregistrements simultanés du même libellé : la contrainte d'unicité tranche.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, error: "Cette catégorie existe déjà." };
    }
    console.error("[categories] enregistrement impossible", err);
    return { success: false, error: "Enregistrement impossible." };
  }
};