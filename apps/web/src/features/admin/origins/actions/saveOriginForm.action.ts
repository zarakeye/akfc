'use server';

import { prisma } from "@backend/prisma";
import { Prisma } from "@prisma/client";
import { saveOriginFormSchema } from "@contracts/forms/saveOriginForm.schema";

export type SaveOriginFormState = {
  success: boolean;
  error?: string;
  originId?: number;
};

function uniqueViolationMessage(
  err: Prisma.PrismaClientKnownRequestError,
): string {
  const target = err.meta?.target;
  if (Array.isArray(target)) {
    if (target.includes("name")) return "Une origine porte déjà ce nom.";
    if (target.includes("slug")) return "Une origine porte déjà ce slug.";
  }
  return "Une origine porte déjà ce nom ou ce slug.";
}

const emptyToNull = (v?: string | null): string | null =>
  v && v.trim() ? v.trim() : null;

export const saveOriginFormAction = async (
  prevState: SaveOriginFormState,
  formData: FormData,
): Promise<SaveOriginFormState> => {
  const parsed = saveOriginFormSchema.safeParse({
    id: formData.get("id") ?? undefined,
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    country: formData.get("country")?.toString() ?? "",
    region: formData.get("region")?.toString() ?? "",
    flag: formData.get("flag")?.toString() ?? "",
    historicalPeriod: formData.get("historicalPeriod")?.toString() ?? "",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;
  const data = {
    name: d.name,
    slug: d.slug,
    description: emptyToNull(d.description),
    country: emptyToNull(d.country),
    region: emptyToNull(d.region),
    flag: emptyToNull(d.flag),
    historicalPeriod: emptyToNull(d.historicalPeriod),
    sortOrder: d.sortOrder,
  };

  try {
    if (d.id === undefined) {
      const created = await prisma.origin.create({ data });
      return { success: true, originId: created.id };
    }
    const updated = await prisma.origin.update({ where: { id: d.id }, data });
    return { success: true, originId: updated.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { success: false, error: uniqueViolationMessage(err) };
      }
      if (err.code === "P2025") {
        return { success: false, error: "Origine introuvable." };
      }
    }
    return { success: false, error: "Enregistrement impossible." };
  }
};