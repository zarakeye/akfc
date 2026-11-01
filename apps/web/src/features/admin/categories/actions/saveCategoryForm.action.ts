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
 *   - absent  → création (refus si la clé ou le libellé existe déjà) ;
 *   - présent → mise à jour (refus si un AUTRE enregistrement porte ce libellé).
 *
 * La clé (`course`, `seminar`, `event`) est choisie dans la liste fixe, à la création ; elle
 * ne change plus ensuite. Seule une catégorie « hors liste » (sans clé) en reçoit une en édition.
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
    key: formData.get("key")?.toString() ?? "",
    type: formData.get("type")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, key, type } = parsed.data;

  // La clé d'une catégorie ne change pas : le code des cours et des galeries s'y fie.
  if (id !== undefined) {
    const current = await prisma.category.findUnique({ where: { id }, select: { key: true } });
    if (!current) return { success: false, error: "Catégorie introuvable." };
    if (current.key !== null && current.key !== key) {
      return { success: false, error: "La catégorie d'une ligne de la liste ne change pas." };
    }
  }

  // Conflits d'unicité — on exclut soi-même en édition.
  const sameKey = await prisma.category.findUnique({ where: { key }, select: { id: true } });
  if (sameKey && sameKey.id !== id) {
    return { success: false, error: "Cette catégorie existe déjà." };
  }
  const sameType = await prisma.category.findUnique({ where: { type }, select: { id: true } });
  if (sameType && sameType.id !== id) {
    return { success: false, error: "Une autre catégorie porte déjà ce libellé." };
  }

  try {
    const saved = await prisma.$transaction(async (tx) => {
      const row =
        id === undefined
          ? await tx.category.create({
              data: { key, type, storageSegment: await newCategorySegment(tx, type) },
            })
          : await tx.category.update({ where: { id }, data: { key, type } });
      // Le finder affiche le libellé ; le dossier, lui, ne bouge pas.
      await setFolderLabel(tx, categoryFolderPath(APP_ROOT, row), row.type);
      return row;
    });
    return { success: true, categoryId: saved.id };
  } catch (err) {
    // Deux enregistrements simultanés de la même clé ou du même libellé : la contrainte tranche.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, error: "Cette catégorie existe déjà." };
    }
    console.error("[categories] enregistrement impossible", err);
    return { success: false, error: "Enregistrement impossible." };
  }
};