import { TRPCError } from "@trpc/server";
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
 * Traduit une intention d'envoi (`UploadDestination`) en dossier de stockage. Le client ne
 * fournit jamais de chemin : tout ce qui compose le dossier est relu en base ou vient de la
 * session.
 *
 * Le nom est historique : le statut d'un fichier ne vit plus dans son chemin (un envoi naît
 * `pending` parce que l'enregistrement écrit `status: "pending"`), et le dossier rendu ici est
 * l'emplacement définitif du fichier.
 *
 *   - existing-discipline : `${appRoot}/<segment de catégorie>/<segment de discipline>`, segments
 *                           FIGÉS à la création (storageSegments.ts) ; la discipline doit
 *                           appartenir à la catégorie annoncée ;
 *   - new-discipline      : `${appRoot}/<segment de catégorie>/new/<slug du nom proposé>` ;
 *   - common_repository   : `${appRoot}/common-repository/<sujet ou depot>_<personne>-<userId>` ;
 *   - perso               : `${appRoot}/personal-space/<personne>-<userId>/photos`, l'id venant
 *                           de la SESSION : on n'écrit que dans son propre espace ;
 *   - event, seminar      : `${appRoot}/events/<slug>`, `${appRoot}/seminars/<slug>` ;
 *   - group               : l'espace du groupe collaboratif (resolveGroupBaseFolder).
 *
 * Une entité absente ou incohérente est une erreur de la requête (NOT_FOUND, BAD_REQUEST),
 * pas une panne du serveur : le message remonte tel quel au formulaire.
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
      throw new TRPCError({ code: "NOT_FOUND", message: "Stage introuvable." });
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
      throw new TRPCError({ code: "NOT_FOUND", message: "Événement introuvable." });
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
    throw new TRPCError({ code: "NOT_FOUND", message: "Catégorie introuvable." });
  }

  const categorySeg = categorySegment(category);

  if (destination.kind === "existing-discipline") {
    const discipline = await prisma.discipline.findUnique({
      where: { id: destination.disciplineId },
      select: { id: true, categoryId: true, name: true, storageSegment: true },
    });

    if (!discipline) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Discipline introuvable." });
    }

    if (discipline.categoryId !== destination.categoryId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cette discipline n'appartient pas à la catégorie choisie." });
    }

    return `${appRoot}/${categorySeg}/${disciplineSegment(discipline)}`;
  }

  // kind === "new-discipline"
  const proposedSlug = slug(destination.proposedDisciplineName);

  if (!proposedSlug) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Le nom proposé doit contenir au moins une lettre ou un chiffre." });
  }

  return `${appRoot}/${categorySeg}/new/${proposedSlug}`;
}
