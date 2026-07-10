'use server';

import { prisma } from "@backend/prisma";
import { Prisma } from "@prisma/client";
import { saveFamilyFormSchema } from "@contracts/forms/saveFamilyForm.schema";

export type SaveFamilyFormState = {
  success: boolean;
  error?: string;
  familyId?: number;
};

/** P2002 → message précisant le champ unique fautif (name ou slug). */
function uniqueViolationMessage(
  err: Prisma.PrismaClientKnownRequestError,
): string {
  const target = err.meta?.target;
  if (Array.isArray(target)) {
    if (target.includes("name")) return "Une famille porte déjà ce nom.";
    if (target.includes("slug")) return "Une famille porte déjà ce slug.";
  }
  return "Une famille porte déjà ce nom ou ce slug.";
}

export const saveFamilyFormAction = async (
  prevState: SaveFamilyFormState,
  formData: FormData,
): Promise<SaveFamilyFormState> => {
  const parsed = saveFamilyFormSchema.safeParse({
    id: formData.get("id") ?? undefined,
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, name, slug, sortOrder } = parsed.data;

  try {
    if (id === undefined) {
      const created = await prisma.disciplineFamily.create({
        data: { name, slug, sortOrder },
      });
      return { success: true, familyId: created.id };
    }
    const updated = await prisma.disciplineFamily.update({
      where: { id },
      data: { name, slug, sortOrder },
    });
    return { success: true, familyId: updated.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { success: false, error: uniqueViolationMessage(err) };
      }
      if (err.code === "P2025") {
        return { success: false, error: "Famille introuvable." };
      }
    }
    return { success: false, error: "Enregistrement impossible." };
  }
};