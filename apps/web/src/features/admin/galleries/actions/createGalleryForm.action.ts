'use server';

import { prisma } from "@backend/prisma";
import { createGalleryFormSchema } from "@contracts/forms/createGalleryForm.schema";

export type CreateGalleryFormState = {
  success: boolean;
  error?: string;
  galleryId?: number;
};

/** Select vide ("") → null, sinon l'id numérique. */
const toFacetId = (s: string): number | null => (s === "" ? null : Number(s));
/** input type="date" vide ("") → null, sinon minuit local du jour choisi. */
const toDate = (s: string): Date | null =>
  s === "" ? null : new Date(`${s}T00:00:00`);

/**
 * 🧩 Action Server — crée une galerie ET ses items en une seule transaction.
 *
 * Les métadonnées sont validées par `createGalleryFormSchema` (titre
 * REQUIS depuis la migration gallery_metadata ; date et facettes
 * cumulables converties ici depuis leurs strings DOM). Les images
 * choisies arrivent dans l'input caché `items` (JSON d'ids média),
 * parsées à part puis créées en `items.create` imbriqué : tout est
 * atomique.
 */
export const createGalleryFormAction = async (
  prevState: CreateGalleryFormState,
  formData: FormData,
): Promise<CreateGalleryFormState> => {
  // Métadonnées
  const str = (k: string) => {
    const v = formData.get(k);
    return v == null ? "" : String(v);
  };
  const result = createGalleryFormSchema.safeParse({
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

  // Items (ids média) — parsés à part, comme les permissions du form de rôle.
  const rawItems = formData.get('items');
  let mediaIds: string[] = [];
  try {
    mediaIds = rawItems ? JSON.parse(String(rawItems)) : [];
  } catch {
    return { success: false, error: "Format des médias invalide." };
  }

  try {
    const created = await prisma.gallery.create({
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
        items:
          mediaIds.length > 0
            ? {
                create: mediaIds.map((mediaAssetId, index) => ({
                  mediaAssetId,
                  sortOrder: index,
                })),
              }
            : undefined,
      },
    });
    return { success: true, galleryId: created.id };
  } catch {
    return {
      success: false,
      error: "Création impossible : ce slug est peut-être déjà utilisé.",
    };
  }
};
