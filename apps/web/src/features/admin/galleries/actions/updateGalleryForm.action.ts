'use server';

import { prisma } from "@backend/prisma";
import { updateGalleryFormSchema } from "@contracts/forms/updateGalleryForm.schema";

export type UpdateGalleryFormState = {
  success: boolean;
  error?: string;
};

/** Select vide ("") → null, sinon l'id numérique. */
const toFacetId = (s: string): number | null => (s === "" ? null : Number(s));
/** input type="date" vide ("") → null, sinon minuit local du jour choisi. */
const toDate = (s: string): Date | null =>
  s === "" ? null : new Date(`${s}T00:00:00`);

/**
 * 🧩 Action Server — met à jour les métadonnées d'une galerie (titre
 * requis, date et facettes cumulables converties depuis les strings DOM).
 */
export const updateGalleryFormAction = async (
  prevState: UpdateGalleryFormState,
  formData: FormData
): Promise<UpdateGalleryFormState> => {
  const str = (k: string) => {
    const v = formData.get(k);
    return v == null ? "" : String(v);
  };
  const result = updateGalleryFormSchema.safeParse({
    id: formData.get('id'),
    title: str('title'),
    slug: formData.get('slug'),
    visibility: formData.get('visibility'),
    sortOrder: Number(formData.get('sortOrder') ?? 0),
    date: str('date'),
    disciplineId: str('disciplineId'),
    categoryId: str('categoryId'),
    stageId: str('stageId'),
    eventId: str('eventId'),
    originId: str('originId'),
  });

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    await prisma.gallery.update({
      where: { id: result.data.id },
      data: {
        title: result.data.title,
        slug: result.data.slug,
        visibility: result.data.visibility,
        sortOrder: result.data.sortOrder,
        date: toDate(result.data.date),
        disciplineId: toFacetId(result.data.disciplineId),
        categoryId: toFacetId(result.data.categoryId),
        stageId: toFacetId(result.data.stageId),
        eventId: toFacetId(result.data.eventId),
        originId: toFacetId(result.data.originId),
      },
    });
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Mise à jour impossible : ce slug est peut-être déjà utilisé.",
    };
  }
};
