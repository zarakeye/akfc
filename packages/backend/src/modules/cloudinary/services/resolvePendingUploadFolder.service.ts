import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

import type { UploadDestination } from "@backend/modules/cloudinary/types/upload.types";

/**
 * resolvePendingUploadFolder.service.ts
 *
 * Traduit une intention d'upload (`Destination`) en chemin Cloudinary
 * `pending` absolu.
 *
 * Règles du chemin :
 *   - `${appRoot}/pending/${slug(category.type)}/${discipline.id}`
 *     pour une `existing-discipline` : discipline déjà inscrite en DB,
 *     identifiée par son id numérique.
 *   - `${appRoot}/pending/${slug(category.type)}/new/${slug(proposedDisciplineName)}`
 *     pour une `new-discipline` : discipline non encore créée en DB. Les assets
 *     restent isolés dans un sous-dossier `new/` jusqu'à ce qu'un admin valide
 *     la création de la discipline.
 *
 * Pourquoi slugifier `category.type` et pas `discipline.id` :
 *   - `category.type` est un libellé humain ("Cours", "Stage", "Démo") qui
 *     peut contenir accents et majuscules — non safe comme segment d'URL/path.
 *   - `discipline.id` est un entier autoincrement : aucun besoin de slug.
 *
 * Invariant de cohérence :
 *   La discipline ciblée doit appartenir à la catégorie ciblée
 *   (`discipline.categoryId === destination.categoryId`). Cette validation
 *   remplace l'ancienne règle soft `activity.martialArt === category.type`
 *   du modèle 3-niveaux — elle est maintenant portée par une foreign key.
 */

const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

export async function resolvePendingUploadFolder(params: {
  prisma: PrismaClient;
  destination: UploadDestination;
  appRoot: string;
}): Promise<string> {
  const { prisma, destination, appRoot } = params;

  const category = await prisma.category.findUnique({
    where: { id: destination.categoryId },
    select: { id: true, type: true },
  });

  if (!category) {
    throw new Error(`Category not found (id=${destination.categoryId})`);
  }

  const categorySegment = slug(category.type);

  if (destination.kind === "existing-discipline") {
    const discipline = await prisma.discipline.findUnique({
      where: { id: destination.disciplineId },
      select: { id: true, categoryId: true },
    });

    if (!discipline) {
      throw new Error(
        `Discipline not found (id=${destination.disciplineId})`
      );
    }

    if (discipline.categoryId !== destination.categoryId) {
      throw new Error(
        `Discipline ${destination.disciplineId} does not belong to category ${destination.categoryId}`
      );
    }

    return `${appRoot}/pending/${categorySegment}/${discipline.id}`;
  }

  // kind === "new-discipline"
  const proposedSlug = slug(destination.proposedDisciplineName);

  if (!proposedSlug) {
    throw new Error(
      "Proposed discipline name must contain at least one slug-friendly character"
    );
  }

  return `${appRoot}/pending/${categorySegment}/new/${proposedSlug}`;
}