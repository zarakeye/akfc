import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2Bucket, getR2Client } from "#modules/storage/adapters/r2/client.ts";

/**
 * Formulaires de droit à l'image : les récapitulatifs validés en ligne (par le membre majeur ou le
 * parent d'un mineur) et les anciens formulaires papier, déposés avant que tout passe en ligne.
 *
 * Fichier dans R2 sous `_private/image-consent/<userId>/`, HORS de la racine de l'appli : il
 * n'apparaît pas dans la bibliothèque et n'est servi que par /api/media/image-consent/[id]
 * (le membre concerné et les admins).
 *
 * User.imageConsentAt est la date des droits en vigueur (formOrder.ts). Les anciens formulaires
 * restent (preuve). À la suppression du compte, ils sont détachés et gardés 5 ans, puis effacés
 * par la purge nocturne.
 */

export const IMAGE_CONSENT_ROOT = "_private/image-consent";

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
