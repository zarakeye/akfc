import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";
import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";

/**
 * resolvePendingUploadFolder.service.ts
 *
 * Traduit une intention d'upload (`Destination`) en chemin Cloudinary
 * `pending` absolu.
 *
 * ─── Destinations couplées à une discipline (historique) ─────────────────
 *   - existing-discipline :
 *       `${appRoot}/pending/${slug(category.type)}/${slug(discipline.name)}`
 *   - new-discipline :
 *       `${appRoot}/pending/${slug(category.type)}/new/${slug(proposedName)}`
 *     Les assets restent isolés dans `new/` jusqu'à validation admin.
 *
 * ─── Destinations découplées (fondation « destination générique ») ────────
 *   - general : `${appRoot}/pending/general`
 *       Espace club sans discipline ni catégorie. Sert d'espace partagé de
 *       fait entre admins (pas de permissions : club petit, confiance).
 *   - perso   : `${appRoot}/pending/persos/${personSlug}-${userId}`
 *       Espace personnel de l'admin qui uploade. Le dossier est dérivé de
 *       `userId` (identité AUTHENTIFIÉE issue du contexte tRPC, jamais un id
 *       fourni par le client) → un admin ne peut écrire que dans son dossier.
 *       `personSlug` = slug(firstName lastName), sinon slug(pseudo), sinon
 *       `user-${userId}` (les trois champs de nom sont nullable en DB).
 *
 * ─── ⚠️ Pourquoi slug du nom et pas l'ID numérique (disciplines) ──────────
 *
 * Historiquement le path utilisait `discipline.id`, ce qui divergeait de
 * `buildR2Path` (UI, en slug) et du finder/TreeView (navigation en slug) :
 * les assets sous `cours/3/` devenaient invisibles dans le finder qui
 * cherchait sous `cours/tchoy-lee-fut/`. On aligne donc Cloudinary sur la
 * convention slug, la seule cohérente avec la navigation UI.
 */
const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

export async function resolvePendingUploadFolder(params: {
  prisma: PrismaClient;
  destination: UploadDestination;
  appRoot: string;
  /**
   * Identité de l'admin qui uploade (issue de `ctx.user.id`). Requise pour la
   * destination `perso` (dossier dérivé de cet id). Ignorée pour les autres.
   */
  userId: string;
}): Promise<string> {
  const { prisma, destination, appRoot, userId } = params;

  /* ── Destination club générique (sans discipline ni catégorie) ── */
  if (destination.kind === "general") {
    return `${appRoot}/pending/general`;
  }

  /* ── Destination personnelle de l'admin (dérivée de userId) ── */
  if (destination.kind === "perso") {
    const base = await resolvePersoBaseFolder({ prisma, appRoot, userId });
    // Les photos vivent dans le sous-dossier `photos/` de l'espace perso, pour
    // une structure homogène avec les futures zones R2 (documents/, audio/).
    return `${base}/photos`;
  }

  /* ── Destinations couplées à une discipline (historique) ── */
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
      select: { id: true, categoryId: true, name: true },
    });

    if (!discipline) {
      throw new Error(`Discipline not found (id=${destination.disciplineId})`);
    }

    if (discipline.categoryId !== destination.categoryId) {
      throw new Error(
        `Discipline ${destination.disciplineId} does not belong to category ${destination.categoryId}`,
      );
    }

    // Fallback `disc-${id}` si le nom slugifie en chaîne vide (cas très rare
    // de nom uniquement composé de caractères non transliterables).
    const disciplineSlug = slug(discipline.name) || `disc-${discipline.id}`;

    return `${appRoot}/pending/${categorySegment}/${disciplineSlug}`;
  }

  // kind === "new-discipline"
  const proposedSlug = slug(destination.proposedDisciplineName);

  if (!proposedSlug) {
    throw new Error(
      "Proposed discipline name must contain at least one slug-friendly character",
    );
  }

  return `${appRoot}/pending/${categorySegment}/new/${proposedSlug}`;
}
