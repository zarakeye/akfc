import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { categorySegment, disciplineSegment } from "@backend/modules/storage/storageSegments";

import type { UploadDestination } from "@contracts/storage/upload-destination.schema";
import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";
import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { commonRepositoryContainerPath } from "@backend/modules/media/services/commonRepositoryContainerPath.service";

/**
 * resolvePendingUploadFolder.service.ts
 *
 * Traduit une intention d'upload (`Destination`) en chemin de stockage absolu.
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
 *       `${appRoot}/<segment de catégorie>/<segment de discipline>` — segments FIGÉS
 *       à la création (`storageSegment`, cf. storageSegments.ts) : renommer une
 *       discipline ne change pas son dossier.
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
 * ─── Pourquoi un segment lisible plutôt que l'id numérique (disciplines) ───
 *
 * Historiquement le path utilisait `discipline.id`, ce qui divergeait de la
 * navigation du finder (en slugs). Le segment est donc un slug — mais calculé
 * UNE FOIS, à la création, et conservé dans `Discipline.storageSegment`.
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
   * Identité de l'admin qui uploade (issue de `ctx.sessionClient.user.id`). Requise pour la
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

  /* ── Destination seminar ── */
  if (destination.kind === "seminar") {
    const seminar = await prisma.seminar.findUnique({
      where: { id: destination.seminarId },
      select: { id: true, slug: true },
    });
    if (!seminar) {
      throw new Error(`Seminar not found (id=${destination.seminarId})`);
    }
    // `Seminar.slug` est nullable (le temps du backfill) → fallback sur l'id.
    const seminarSlug = seminar.slug ? slug(seminar.slug) : `seminar-${seminar.id}`;
    return `${appRoot}/seminars/${seminarSlug || `seminar-${seminar.id}`}`;
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
    select: { id: true, type: true, storageSegment: true },
  });

  if (!category) {
    throw new Error(`Category not found (id=${destination.categoryId})`);
  }

  const categorySeg = categorySegment(category);

  if (destination.kind === "existing-discipline") {
    const discipline = await prisma.discipline.findUnique({
      where: { id: destination.disciplineId },
      select: { id: true, categoryId: true, name: true, storageSegment: true },
    });

    if (!discipline) {
      throw new Error(`Discipline not found (id=${destination.disciplineId})`);
    }

    if (discipline.categoryId !== destination.categoryId) {
      throw new Error(
        `Discipline ${destination.disciplineId} does not belong to category ${destination.categoryId}`,
      );
    }

    return `${appRoot}/${categorySeg}/${disciplineSegment(discipline)}`;
  }

  // kind === "new-discipline"
  const proposedSlug = slug(destination.proposedDisciplineName);

  if (!proposedSlug) {
    throw new Error(
      "Proposed discipline name must contain at least one slug-friendly character",
    );
  }

  return `${appRoot}/${categorySeg}/new/${proposedSlug}`;
}
