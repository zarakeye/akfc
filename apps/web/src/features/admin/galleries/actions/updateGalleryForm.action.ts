'use server';

import { prisma } from "@backend/prisma";
import { ADMIN_ONLY_MESSAGE, callerIsAdmin } from "@features/admin/common/actions/callerIsAdmin";
import { updateGalleryFormSchema } from "@contracts/forms/updateGalleryForm.schema";
import { galleryRightsError } from "@backend/modules/mediaPeople/mediaPeople.service";

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
  // Point d'accès public : les droits se vérifient ici, avant toute lecture du formulaire.
  if (!(await callerIsAdmin())) return { success: false, error: ADMIN_ONLY_MESSAGE };

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
    seminarId: str('seminarId'),
    eventId: str('eventId'),
    originId: str('originId'),
  });

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  // Droit à l'image : changer de visibilité (membres → public) ou devenir le carrousel revérifie
  // les médias déjà présents.
  const items = await prisma.galleryItem.findMany({
    where: { galleryId: result.data.id },
    orderBy: { sortOrder: "asc" },
    select: { mediaAssetId: true },
  });
  const rightsError = await galleryRightsError(prisma, result.data, items.map((it) => it.mediaAssetId));
  if (rightsError) return { success: false, error: rightsError };

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
        seminarId: toFacetId(result.data.seminarId),
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
