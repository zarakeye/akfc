import crypto from "crypto";
import { assertPasswordOfConnectedUser } from "#lib/security/passwordCheck.ts";
import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Bucket, getR2Client } from "#modules/storage/adapters/r2/client.ts";
import { sendImageConsentNotice } from "#email/templates/imageConsentNotice.ts";
import { buildConsentPdf } from "#modules/imageConsent/consentPdf.service.ts";
import { IMAGE_CONSENT_ROOT } from "#modules/imageConsent/imageConsentForm.service.ts";
import { byEffectiveDesc, latestFormUsages } from "#modules/imageConsent/formOrder.ts";
import { pendingGuardianRequest } from "#modules/imageConsent/imageConsentGuardian.service.ts";
import {
  IMAGE_CONSENT_TEXT_VERSION,
  IMAGE_USAGE_VALUES,
  consentFromUsages,
  effectiveLegalAge,
  missingForMinor,
  type ImageUsageValue,
} from "@akfc/contracts/legal/imageConsent.ts";

/**
 * Droit à l'image donné EN LIGNE.
 *
 * Membre majeur, connecté : il coche ses choix et confirme avec son mot de passe (une session restée
 * ouverte ne suffit pas : la confirmation est un geste de signature). Le serveur produit le
 * récapitulatif PDF (le formulaire du club, rempli et figé), le range avec les formulaires papier
 * (`_private/image-consent/<userId>/`), crée la version (source ONLINE_MEMBER) et met à jour le
 * statut, puis avise la boîte du club.
 *
 * Le circuit du parent référent d'un mineur (lien par e-mail) : imageConsentGuardian.service.ts.
 */

export const memberSelect = {
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  birthDate: true,
  birthDateVerified: true,
  legalAge: true,
  guardianName: true,
  guardianEmail: true,
  guardianRelation: true,
} as const;

export function fullName(m: { firstName: string | null; lastName: string | null }): string {
  return [m.firstName, m.lastName].filter(Boolean).join(" ").trim();
}

/** Usages dédoublonnés, dans l'ordre du formulaire. */
export function normalizeUsages(usages: readonly ImageUsageValue[]): ImageUsageValue[] {
  return IMAGE_USAGE_VALUES.filter((u) => usages.includes(u));
}

/** Range un récapitulatif PDF dans l'espace privé du membre et renvoie sa clé. */
export async function storeReceipt(userId: string, bytes: Uint8Array): Promise<string> {
  const key = `${IMAGE_CONSENT_ROOT}/${userId}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.pdf`;
  await getR2Client().send(
    new PutObjectCommand({ Bucket: getR2Bucket(), Key: key, Body: bytes, ContentType: "application/pdf" }),
  );
  return key;
}

export async function removeObject(key: string): Promise<void> {
  await getR2Client()
    .send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }))
    .catch(() => undefined);
}

/** Ce que le profil doit savoir pour proposer (ou non) l'autorisation en ligne. */
export async function onlineConsentState(prisma: PrismaClient, userId: string) {
  const m = await prisma.user.findUnique({ where: { id: userId }, select: memberSelect });
  if (!m) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
  const legalAge = effectiveLegalAge(m);
  const missing = legalAge === "MINOR" ? missingForMinor(m) : [];
  return {
    legalAge,
    /** Majeur dont le nom est renseigné : il confirme lui-même, en ligne. */
    canConfirmOnline: legalAge === "ADULT" && fullName(m) !== "",
    /** Mineur : ce qui manque avant l'envoi au parent. */
    missing,
    /**
     * Date de naissance non modifiable dans le profil : « GUARDIAN » pour un mineur (c'est son
     * parent qui la confirme ou la corrige, en validant l'autorisation), « CLUB » si la majorité
     * n'est pas renseignée et que la date vient du club ; null : le membre (majeur) la corrige.
     */
    birthDateLock: legalAge === "MINOR" ? ("GUARDIAN" as const) : legalAge === "UNKNOWN" && m.birthDateVerified ? ("CLUB" as const) : null,
    /**
     * Majeur dont les droits en vigueur ont été signés par son parent (devenu majeur depuis) : ils
     * restent valables jusqu'à ce qu'il confirme ou modifie les siens.
     */
    reconfirm: legalAge === "ADULT" && (await latestSignedByGuardian(prisma, userId)),
    /** Adresse du parent, masquée (le membre ne la voit pas en entier). */
    guardianEmailMasked: m.guardianEmail ? maskEmail(m.guardianEmail) : null,
    /** Mineur dont tout est renseigné : il indique ses souhaits, le lien part à son parent. */
    canRequestGuardian: legalAge === "MINOR" && missing.length === 0,
    /** Mineur : la demande en cours (souhaits, lien envoyé, validité), ou null. */
    pendingGuardian: legalAge === "MINOR" ? await pendingGuardianRequest(prisma, userId) : null,
  };
}

/** Le formulaire en vigueur (le plus récent par date des droits) a-t-il été signé par un parent ? */
async function latestSignedByGuardian(prisma: PrismaClient, userId: string): Promise<boolean> {
  const forms = await prisma.imageConsentForm.findMany({
    where: { userId },
    select: { signerQuality: true, source: true, signedAt: true, createdAt: true },
  });
  const latest = forms.sort(byEffectiveDesc)[0];
  return Boolean(latest && (latest.source === "ONLINE_GUARDIAN" || latest.signerQuality));
}

/** « c•••@example.com ». */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  return `${local.slice(0, 1)}•••@${domain}`;
}

/** Confirmation en ligne par le membre majeur. */
/** Mot de passe faux à la signature : le formulaire range ce refus sous le champ du mot de passe. */
export const CONSENT_WRONG_PASSWORD = "Mot de passe incorrect.";

export async function confirmMemberConsent(params: {
  prisma: PrismaClient;
  userId: string;
  password: string;
  usages: readonly ImageUsageValue[];
  keepAfterLeave: boolean | null;
}): Promise<{ id: string }> {
  const { prisma, userId } = params;
  const m = await prisma.user.findUnique({ where: { id: userId }, select: memberSelect });
  if (!m) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
  if (effectiveLegalAge(m) !== "ADULT") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        m.legalAge === "MINOR"
          ? "Pour un membre mineur, l'autorisation est donnée par son parent référent."
          : "Votre majorité n'est pas encore renseignée par le club : remettez le formulaire papier, ou demandez à un instructeur de la renseigner.",
    });
  }
  const name = fullName(m);
  if (!name) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Renseignez d'abord vos nom et prénom dans votre profil." });
  }
  // Le mot de passe vaut signature ; ses essais sont limités comme ceux de la connexion.
  await assertPasswordOfConnectedUser({
    userId,
    password: params.password,
    hash: m.password,
    wrongMessage: CONSENT_WRONG_PASSWORD,
  });

  const usages = normalizeUsages(params.usages);
  const confirmedAt = new Date();
  const pdf = await buildConsentPdf(m, {
    usages,
    keepAfterLeave: params.keepAfterLeave,
    signerName: name,
    signerQuality: null,
    confirmedAt,
    signatureLines: [
      `depuis son compte (${m.email}), mot de passe saisi`,
      `Texte de l'autorisation : version ${IMAGE_CONSENT_TEXT_VERSION}`,
    ],
  });
  const previous = await latestFormUsages(prisma, userId);
  const key = await storeReceipt(userId, pdf);

  try {
    const [form] = await prisma.$transaction([
      prisma.imageConsentForm.create({
        data: {
          userId,
          memberName: name,
          storageKey: key,
          mimeType: "application/pdf",
          fileName: `autorisation-droit-image-${confirmedAt.toISOString().slice(0, 10)}.pdf`,
          size: pdf.byteLength,
          usages,
          keepAfterLeave: params.keepAfterLeave,
          signedAt: confirmedAt,
          source: "ONLINE_MEMBER",
          textVersion: IMAGE_CONSENT_TEXT_VERSION,
          signerName: name,
          memberBirthDate: m.birthDate,
        },
        select: { id: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { imageConsent: consentFromUsages(usages), imageConsentAt: confirmedAt },
        select: { id: true },
      }),
    ]);

    await sendImageConsentNotice({
      userId,
      memberName: name,
      via: "en ligne par le membre",
      usages,
      previousUsages: previous,
    }).catch((err) => console.error("[droit à l'image] avis au club non envoyé :", err instanceof Error ? err.message : err));

    return { id: form.id };
  } catch (err) {
    await removeObject(key);
    throw err;
  }
}
