import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Bucket, getR2Client, getR2PresignClient } from "@backend/modules/storage/adapters/r2/client";
import {
  IMAGE_CONSENT_FORM_MAX_BYTES,
  IMAGE_CONSENT_FORM_MIME_EXT,
  consentFromUsages,
  type ImageUsageValue,
} from "@contracts/legal/imageConsent";
import { sendImageConsentNotice } from "@backend/email/templates/imageConsentNotice";
import { latestFormUsages } from "@backend/modules/imageConsent/formOrder";

/**
 * Formulaires de droit à l'image SIGNÉS — déposés par un admin sur la fiche d'un membre.
 *
 * Fichier dans R2 sous `_private/image-consent/<userId>/`, HORS de la racine de l'appli : il
 * n'apparaît pas dans la bibliothèque et n'est servi que par /api/media/image-consent/[id]
 * (le membre concerné et les admins). Envoi direct navigateur → R2 (URL signée), comme l'avatar.
 *
 * Le dépôt fixe User.imageConsent d'après les usages cochés, SI ses droits sont les plus récents :
 * un formulaire signé avant les droits en vigueur est archivé (preuve) sans changer le statut
 * (formOrder.ts). User.imageConsentAt est la date des droits en vigueur. Les anciens restent (preuve). À la suppression du compte, les formulaires sont détachés et
 * gardés 5 ans, puis effacés par la purge nocturne.
 */

export const IMAGE_CONSENT_ROOT = "_private/image-consent";

function formFolder(userId: string): string {
  return `${IMAGE_CONSENT_ROOT}/${userId}`;
}

async function removeObject(key: string): Promise<void> {
  try {
    await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }));
  } catch {
    // déjà absent — rien à faire
  }
}

/** URL signée (PUT, 5 min) pour envoyer le formulaire d'un membre, et la clé à renvoyer à `register`. */
export async function createImageConsentFormUpload(params: { userId: string; mimeType: string; bytes: number }) {
  const ext = IMAGE_CONSENT_FORM_MIME_EXT[params.mimeType];
  if (!ext) throw new TRPCError({ code: "BAD_REQUEST", message: "Format non accepté : PDF, JPEG, PNG ou WebP." });
  if (params.bytes <= 0 || params.bytes > IMAGE_CONSENT_FORM_MAX_BYTES) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier trop volumineux (15 Mo au plus)." });
  }
  const path = `${formFolder(params.userId)}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const uploadUrl = await getSignedUrl(
    getR2PresignClient(),
    new PutObjectCommand({ Bucket: getR2Bucket(), Key: path, ContentType: params.mimeType }),
    { expiresIn: 5 * 60 },
  );
  return { uploadUrl, path };
}

/**
 * Après l'envoi : vérifie le fichier, crée la fiche, et met à jour le statut du membre si ce
 * formulaire porte des droits plus récents que ceux en vigueur (`applied`).
 */
export async function registerImageConsentForm(params: {
  prisma: PrismaClient;
  userId: string;
  uploadedById: string;
  path: string;
  fileName: string;
  usages: ImageUsageValue[];
  keepAfterLeave: boolean | null;
  signedAt: Date | null;
}) {
  const { prisma, userId, path } = params;
  const ext = path.split(".").pop() ?? "";
  const mimeType = Object.keys(IMAGE_CONSENT_FORM_MIME_EXT).find((m) => IMAGE_CONSENT_FORM_MIME_EXT[m] === ext);
  if (!path.startsWith(`${formFolder(userId)}/`) || path.includes("..") || !mimeType) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Chemin hors de l'espace du membre." });
  }
  const head = await getR2Client()
    .send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: path }))
    .catch(() => null);
  if (!head) throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier introuvable : l'envoi n'a pas abouti." });
  const size = head.ContentLength ?? 0;
  if (size <= 0 || size > IMAGE_CONSENT_FORM_MAX_BYTES || head.ContentType !== mimeType) {
    await removeObject(path);
    throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier refusé." });
  }

  const usages = [...new Set(params.usages)];
  const member = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, pseudo: true, email: true, imageConsentAt: true },
  });
  if (!member) {
    await removeObject(path);
    throw new TRPCError({ code: "NOT_FOUND", message: "Membre introuvable." });
  }
  const memberName =
    [member.firstName, member.lastName].filter(Boolean).join(" ").trim() || member.pseudo || member.email;
  const previousUsages = await latestFormUsages(prisma, userId);
  // Les droits ne changent que pour des droits plus récents : sans date de signature, ceux du jour.
  const effectiveAt = params.signedAt ?? new Date();
  const applied = !member.imageConsentAt || effectiveAt.getTime() >= member.imageConsentAt.getTime();
  const [form] = await prisma.$transaction([
    prisma.imageConsentForm.create({
      data: {
        userId,
        memberName,
        storageKey: path,
        mimeType,
        fileName: params.fileName.trim().slice(0, 200) || `autorisation.${ext}`,
        size,
        usages,
        keepAfterLeave: params.keepAfterLeave,
        signedAt: params.signedAt,
        uploadedById: params.uploadedById,
      },
      select: { id: true },
    }),
    ...(applied
      ? [
          prisma.user.update({
            where: { id: userId },
            data: { imageConsent: consentFromUsages(usages), imageConsentAt: effectiveAt },
            select: { id: true },
          }),
        ]
      : []),
  ]);
  if (!applied) return { id: form.id, applied };
  await sendImageConsentNotice({
    userId,
    memberName,
    via: "par formulaire papier déposé par un administrateur",
    usages,
    previousUsages,
  }).catch((err) => console.error("[droit à l'image] avis au club non envoyé :", err instanceof Error ? err.message : err));
  return { id: form.id, applied };
}

/** Supprime un formulaire (fichier + fiche). Le statut du membre n'est pas modifié. */
export async function deleteImageConsentForm(prisma: PrismaClient, id: string): Promise<void> {
  const form = await prisma.imageConsentForm.findUnique({ where: { id }, select: { storageKey: true } });
  if (!form) return;
  // Le fichier d'abord : s'il ne part pas, la fiche reste et l'administrateur peut réessayer.
  // L'inverse laisserait un document signé dans le stockage sans plus aucune ligne pour le désigner.
  try {
    await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: form.storageKey }));
  } catch (err) {
    console.error(`[droit à l'image] formulaire ${id} : fichier non supprimé :`, err instanceof Error ? err.message : err);
    throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Le fichier n'a pas pu être supprimé. Réessayez dans un instant." });
  }
  await prisma.imageConsentForm.delete({ where: { id } });
}

/** Durée de conservation d'un formulaire après la suppression du compte (preuve du consentement). */
export const DETACHED_FORM_RETENTION_YEARS = 5;

/** Purge nocturne : formulaires détachés depuis plus de 5 ans (fiche et fichier). */
export async function purgeDetachedImageConsentForms(prisma: PrismaClient, now = new Date()): Promise<number> {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - DETACHED_FORM_RETENTION_YEARS);
  const old = await prisma.imageConsentForm.findMany({
    where: { userId: null, detachedAt: { lt: cutoff } },
    select: { id: true, storageKey: true },
  });
  let purged = 0;
  for (const f of old) {
    // Le fichier d'abord, la fiche ensuite, et la fiche SEULEMENT si le fichier est parti : un échec
    // laisse la fiche, et la purge suivante réessaiera. Dans l'autre ordre (ou en ignorant l'échec),
    // un document signé resterait dans le stockage sans plus aucune ligne pour le désigner.
    // (Supprimer une clé déjà absente réussit : un fichier déjà parti n'empêche rien.)
    try {
      await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: f.storageKey }));
    } catch (err) {
      console.error(`[droit à l'image] formulaire ${f.id} non purgé (fichier) :`, err instanceof Error ? err.message : err);
      continue;
    }
    await prisma.imageConsentForm.delete({ where: { id: f.id } });
    purged += 1;
  }
  return purged;
}

/** Champs exposés d'un formulaire (jamais la clé R2). */
export const imageConsentFormSelect = {
  id: true,
  mimeType: true,
  fileName: true,
  size: true,
  usages: true,
  keepAfterLeave: true,
  signedAt: true,
  createdAt: true,
  source: true,
  signerName: true,
  signerQuality: true,
  /** Validation par le parent : les souhaits du membre mineur (voir ImageConsentForm.memberWishes). */
  memberWishes: true,
} as const;
