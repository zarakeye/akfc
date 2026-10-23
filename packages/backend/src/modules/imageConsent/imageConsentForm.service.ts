import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

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

/**
 * Formulaires de droit à l'image SIGNÉS — déposés par un admin sur la fiche d'un membre.
 *
 * Fichier dans R2 sous `_private/image-consent/<userId>/`, HORS de la racine de l'appli : il
 * n'apparaît pas dans la bibliothèque et n'est servi que par /api/media/image-consent/[id]
 * (le membre concerné et les admins). Envoi direct navigateur → R2 (URL signée), comme l'avatar.
 *
 * Le dépôt fixe User.imageConsent d'après les usages cochés : le formulaire le plus récent fait
 * foi. Les anciens restent (preuve). À la suppression du compte, les formulaires sont détachés et
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
  if (!ext) throw new Error("Format non accepté : PDF, JPEG, PNG ou WebP.");
  if (params.bytes <= 0 || params.bytes > IMAGE_CONSENT_FORM_MAX_BYTES) {
    throw new Error("Fichier trop volumineux (15 Mo au plus).");
  }
  const path = `${formFolder(params.userId)}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const uploadUrl = await getSignedUrl(
    getR2PresignClient(),
    new PutObjectCommand({ Bucket: getR2Bucket(), Key: path, ContentType: params.mimeType }),
    { expiresIn: 5 * 60 },
  );
  return { uploadUrl, path };
}

/** Après l'envoi : vérifie le fichier, crée la fiche et met à jour le statut du membre. */
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
    throw new Error("Chemin hors de l'espace du membre.");
  }
  const head = await getR2Client()
    .send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: path }))
    .catch(() => null);
  if (!head) throw new Error("Fichier introuvable : l'envoi n'a pas abouti.");
  const size = head.ContentLength ?? 0;
  if (size <= 0 || size > IMAGE_CONSENT_FORM_MAX_BYTES || head.ContentType !== mimeType) {
    await removeObject(path);
    throw new Error("Fichier refusé.");
  }

  const usages = [...new Set(params.usages)];
  const member = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, pseudo: true, email: true },
  });
  if (!member) {
    await removeObject(path);
    throw new Error("Membre introuvable.");
  }
  const memberName =
    [member.firstName, member.lastName].filter(Boolean).join(" ").trim() || member.pseudo || member.email;
  const previous = await prisma.imageConsentForm.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { usages: true },
  });
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
    prisma.user.update({
      where: { id: userId },
      data: { imageConsent: consentFromUsages(usages), imageConsentAt: new Date() },
      select: { id: true },
    }),
  ]);
  await sendImageConsentNotice({
    userId,
    memberName,
    via: "par formulaire papier déposé par un administrateur",
    usages,
    previousUsages: previous ? previous.usages : null,
  }).catch((err) => console.error("[droit à l'image] avis au club non envoyé :", err instanceof Error ? err.message : err));
  return { id: form.id };
}

/** Supprime un formulaire (fichier + fiche). Le statut du membre n'est pas modifié. */
export async function deleteImageConsentForm(prisma: PrismaClient, id: string): Promise<void> {
  const form = await prisma.imageConsentForm.findUnique({ where: { id }, select: { storageKey: true } });
  if (!form) return;
  await prisma.imageConsentForm.delete({ where: { id } });
  await removeObject(form.storageKey);
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
  for (const f of old) {
    await removeObject(f.storageKey);
    await prisma.imageConsentForm.delete({ where: { id: f.id } });
  }
  return old.length;
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
} as const;
