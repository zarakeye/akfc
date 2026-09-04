import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";
import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";
import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { commonRepositoryContainerPath } from "@backend/modules/media/services/commonRepositoryContainerPath.service";

/**
 * resolvePendingUploadFolder.service.ts
 *
 * Traduit une intention d'upload (`Destination`) en chemin Cloudinary absolu.
 *
 * ─── ⚠️ Le nom de cette fonction est historique ──────────────────────────
 *
 * Elle ne résout plus rien de « pending ». Depuis l'étape 3, un upload naît
 * `pending` parce que `registerUploadedAssets` écrit `status: "pending"` en
 * base — pas parce qu'il atterrit sous un dossier qui s'appelle ainsi. Le
 * chemin ne dit plus le statut : il dit juste où est le fichier.
 *
 * Le renommage (`resolveUploadFolder`) touche `registerUploadedAssets`,
 * `createUploadSignatures`, un commentaire de `DragNDropForm` et un tutoriel
 * MDX. Il part avec le reste à l'étape 6, plutôt que d'élargir un incrément
 * qui parle de chemins.
 *
 * ─── Destinations couplées à une discipline (historique) ─────────────────
 *   - existing-discipline :
 *       `${appRoot}/${slug(category.type)}/${slug(discipline.name)}`
 *   - new-discipline :
 *       `${appRoot}/${slug(category.type)}/new/${slug(proposedName)}`
 *     Les assets restent isolés dans `new/` jusqu'à validation admin.
 *
 * ─── Destinations découplées (fondation « destination générique ») ────────
 *   - general : `${appRoot}/general`
 *       Espace club sans discipline ni catégorie. Sert d'espace partagé de
 *       fait entre admins (pas de permissions : club petit, confiance).
 *   - perso   : `${appRoot}/persos/${personSlug}-${userId}`
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
  if (destination.kind === "common_repository") {
    // Chemin du conteneur = source unique partagée avec setCommonRepositoryLabel.
    return commonRepositoryContainerPath({
      prisma,
      appRoot,
      userId,
      subject: destination.containerName,
    });
  }

  /* ── Destination stage ── */
  if (destination.kind === "stage") {
    const stage = await prisma.stage.findUnique({
      where: { id: destination.stageId },
      select: { id: true, slug: true },
    });
    if (!stage) {
      throw new Error(`Stage not found (id=${destination.stageId})`);
    }
    // `Stage.slug` est nullable (le temps du backfill) → fallback sur l'id.
    const stageSlug = stage.slug ? slug(stage.slug) : `stage-${stage.id}`;
    return `${appRoot}/stages/${stageSlug || `stage-${stage.id}`}`;
  }

  /* ── Destination événement ── */
  if (destination.kind === "event") {
    const event = await prisma.event.findUnique({
      where: { id: destination.eventId },
      select: { id: true, slug: true },
    });

    if (!event) {
      throw new Error(`Event not found (id=${destination.eventId})`);
    }

    // `Event.slug` est nullable (le temps du backfill) → fallback sur l'id,
    // qui reste stable et unique.
    const eventSlug = event.slug ? slug(event.slug) : `event-${event.id}`;

    return `${appRoot}/events/${eventSlug || `event-${event.id}`}`;
  }

  /* ── Destination personnelle de l'admin (dérivée de userId) ── */
  if (destination.kind === "perso") {
    const base = await resolvePersoBaseFolder({ prisma, appRoot, userId });
    // Les photos vivent dans le sous-dossier `photos/` de l'espace perso, pour
    // une structure homogène avec les futures zones R2 (documents/, audio/).
    return `${base}/photos`;
  }

  /* ── Destination espace d'un groupe collaboratif (dérivée du groupe) ── */
  if (destination.kind === "group") {
    // resolveGroupBaseFolder valide l'existence + le caractère collaboratif.
    return resolveGroupBaseFolder({ prisma, appRoot, groupId: destination.groupId });
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

    return `${appRoot}/${categorySegment}/${disciplineSlug}`;
  }

  // kind === "new-discipline"
  const proposedSlug = slug(destination.proposedDisciplineName);

  if (!proposedSlug) {
    throw new Error(
      "Proposed discipline name must contain at least one slug-friendly character",
    );
  }

  return `${appRoot}/${categorySegment}/new/${proposedSlug}`;
}
