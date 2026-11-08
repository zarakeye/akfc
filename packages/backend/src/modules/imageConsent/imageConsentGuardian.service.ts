import crypto from "crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { sendImageConsentNotice } from "@backend/email/templates/imageConsentNotice";
import {
  sendGuardianConsentLink,
  sendGuardianConsentResultToMember,
} from "@backend/email/templates/imageConsentGuardian";
import { buildConsentPdf } from "@backend/modules/imageConsent/consentPdf.service";
import { latestFormUsages } from "@backend/modules/imageConsent/formOrder";
import {
  fullName,
  maskEmail,
  memberSelect,
  normalizeUsages,
  removeObject,
  storeReceipt,
} from "@backend/modules/imageConsent/imageConsentOnline.service";
import {
  GUARDIAN_LINK_COOLDOWN_MS,
  GUARDIAN_LINK_TTL_MS,
  IMAGE_CONSENT_TEXT_VERSION,
  compareWishes,
  consentFromUsages,
  describeWishChanges,
  effectiveLegalAge,
  missingForMinor,
  type ConsentChoices,
  type ImageUsageValue,
} from "@contracts/legal/imageConsent";

/**
 * Droit à l'image d'un membre MINEUR, validé en ligne par son parent référent.
 *
 * 1. Le mineur, connecté, coche ses SOUHAITS (`requestGuardianConsent`) : sans effet sur ses droits.
 * 2. Le parent référent (nom, qualité et adresse saisis par le club, jamais par le mineur) reçoit
 *    un lien personnel, à usage unique, valable 7 jours. Seule l'empreinte SHA-256 du jeton est
 *    gardée (ImageConsentRequest.tokenHash) : la base ne permet pas de reconstituer le lien.
 * 3. Le parent ouvre le formulaire pré-rempli des souhaits (`guardianRequestByToken`), peut tout
 *    changer, se déclare représentant légal et valide (`confirmGuardianConsent`). Ses choix font foi.
 * 4. À la validation : PDF figé (avec une page « souhaits du membre / choix du parent »), nouvelle
 *    version (source ONLINE_GUARDIAN, souhaits gardés dans memberWishes), statut mis à jour, lien
 *    grillé ; avis à la boîte du club et e-mail au membre, changements mis en évidence.
 *
 * Ce qui prouve que c'est le parent : l'accès à SA boîte mail, l'adresse ayant été saisie par le
 * club. Un code envoyé à la même adresse n'ajouterait rien.
 */

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function linkInvalid(): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Ce lien n'est plus valable (déjà utilisé, remplacé par un plus récent, ou expiré). Demandez-en un nouveau au club.",
  });
}

type Member = Prisma.UserGetPayload<{ select: typeof memberSelect }>;

async function loadMinor(prisma: PrismaClient, userId: string): Promise<Member> {
  const m = await prisma.user.findUnique({ where: { id: userId }, select: memberSelect });
  if (!m) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
  if (effectiveLegalAge(m) !== "MINOR") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Ce circuit concerne les membres mineurs : un membre majeur confirme lui-même." });
  }
  const missing = missingForMinor(m);
  if (missing.length > 0) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Le club doit d'abord renseigner : ${missing.join(", ")}.` });
  }
  return m;
}

/** Crée (ou remplace) la demande, envoie le lien au parent. Un nouveau lien grille le précédent. */
async function issueLink(prisma: PrismaClient, userId: string, m: Member, wishes: ConsentChoices) {
  const existing = await prisma.imageConsentRequest.findUnique({ where: { userId }, select: { sentAt: true } });
  if (existing?.sentAt && Date.now() - existing.sentAt.getTime() < GUARDIAN_LINK_COOLDOWN_MS) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Un lien vient d'être envoyé : réessayez dans quelques minutes." });
  }
  const token = crypto.randomBytes(32).toString("base64url");
  const sentAt = new Date();
  const expiresAt = new Date(sentAt.getTime() + GUARDIAN_LINK_TTL_MS);
  const to = m.guardianEmail as string;
  const data = {
    usages: normalizeUsages(wishes.usages),
    keepAfterLeave: wishes.keepAfterLeave,
    tokenHash: hashToken(token),
    sentTo: to,
    sentAt,
    expiresAt,
  };
  await prisma.imageConsentRequest.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  try {
    await sendGuardianConsentLink({
      to,
      guardianName: m.guardianName as string,
      memberName: fullName(m),
      token,
      expiresAt,
    });
  } catch (err) {
    // Lien jamais parti : on ne laisse pas croire qu'il attend le parent.
    await prisma.imageConsentRequest.update({ where: { userId }, data: { tokenHash: null, sentAt: null, expiresAt: null } });
    console.error("[droit à l'image] lien au parent non envoyé :", err instanceof Error ? err.message : err);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "L'e-mail au parent n'a pas pu partir. Réessayez plus tard." });
  }
  return { sentToMasked: maskEmail(to), expiresAt };
}

/** Le membre mineur, connecté : ses souhaits, puis le lien envoyé à son parent référent. */
export async function requestGuardianConsent(params: {
  prisma: PrismaClient;
  userId: string;
  usages: readonly ImageUsageValue[];
  keepAfterLeave: boolean | null;
}) {
  const m = await loadMinor(params.prisma, params.userId);
  return issueLink(params.prisma, params.userId, m, { usages: params.usages, keepAfterLeave: params.keepAfterLeave });
}

/** Un administrateur renvoie le lien (perdu, expiré) : mêmes souhaits, nouveau lien. */
export async function resendGuardianLink(prisma: PrismaClient, userId: string) {
  const m = await loadMinor(prisma, userId);
  const req = await prisma.imageConsentRequest.findUnique({ where: { userId }, select: { usages: true, keepAfterLeave: true } });
  if (!req) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Le membre n'a pas encore indiqué ses souhaits : rien à renvoyer." });
  }
  return issueLink(prisma, userId, m, req);
}

/** Demande valable pour ce jeton, avec le membre ; sinon « lien plus valable ». */
async function findByToken(prisma: PrismaClient, token: string) {
  if (!TOKEN_PATTERN.test(token)) linkInvalid();
  const req = await prisma.imageConsentRequest.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      userId: true,
      usages: true,
      keepAfterLeave: true,
      sentTo: true,
      expiresAt: true,
      user: { select: memberSelect },
    },
  });
  if (!req || !req.expiresAt || req.expiresAt.getTime() <= Date.now()) linkInvalid();
  return req;
}

/** Page du parent : ce qu'il faut afficher (jamais d'adresse e-mail). */
export async function guardianRequestByToken(prisma: PrismaClient, token: string) {
  const req = await findByToken(prisma, token);
  const m = req.user;
  return {
    memberName: fullName(m),
    guardianName: m.guardianName ?? "",
    guardianRelation: m.guardianRelation ?? "",
    /** Souhaits du membre, à pré-cocher. */
    usages: req.usages,
    keepAfterLeave: req.keepAfterLeave,
    expiresAt: req.expiresAt,
    textVersion: IMAGE_CONSENT_TEXT_VERSION,
    /** Devenu majeur entre-temps : le parent ne peut plus valider. */
    stillMinor: effectiveLegalAge(m) === "MINOR",
  };
}

/** Le parent valide : ses choix font foi. */
export async function confirmGuardianConsent(params: {
  prisma: PrismaClient;
  token: string;
  usages: readonly ImageUsageValue[];
  keepAfterLeave: boolean | null;
}): Promise<{ changes: string[] }> {
  const { prisma } = params;
  const req = await findByToken(prisma, params.token);
  const m = req.user;
  if (effectiveLegalAge(m) !== "MINOR") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Ce membre est devenu majeur : il confirme désormais lui-même son autorisation." });
  }
  const guardianName = m.guardianName?.trim() ?? "";
  const relation = m.guardianRelation?.trim() ?? "";
  if (!guardianName || !relation) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Les coordonnées du parent ne sont plus complètes : contactez le club." });
  }
  const memberName = fullName(m);
  const wishes: ConsentChoices = { usages: req.usages, keepAfterLeave: req.keepAfterLeave };
  const final: ConsentChoices = { usages: normalizeUsages(params.usages), keepAfterLeave: params.keepAfterLeave };
  const changes = describeWishChanges(compareWishes(wishes, final));
  const confirmedAt = new Date();

  const pdf = await buildConsentPdf(
    { ...m, legalAge: "MINOR" },
    {
      ...final,
      signerName: guardianName,
      signerQuality: relation,
      confirmedAt,
      signatureLines: [
        `par le lien personnel envoyé à ${req.sentTo ?? "l'adresse du parent"}`,
        `Texte de l'autorisation : version ${IMAGE_CONSENT_TEXT_VERSION}`,
        changes.length ? "Souhaits du membre modifiés : voir la dernière page" : "Souhaits du membre gardés : voir la dernière page",
      ],
      memberWishes: wishes,
    },
  );
  const previous = await latestFormUsages(prisma, req.userId);
  const key = await storeReceipt(req.userId, pdf);

  try {
    await prisma.$transaction(async (tx) => {
      // Usage unique, même si le parent valide deux fois d'affilée : la demande n'est supprimée
      // qu'une fois, la seconde validation échoue ici et rien n'est enregistré en double.
      const { count } = await tx.imageConsentRequest.deleteMany({ where: { id: req.id, tokenHash: hashToken(params.token) } });
      if (count !== 1) linkInvalid();
      await tx.imageConsentForm.create({
        data: {
          userId: req.userId,
          memberName,
          storageKey: key,
          mimeType: "application/pdf",
          fileName: `autorisation-droit-image-${confirmedAt.toISOString().slice(0, 10)}.pdf`,
          size: pdf.byteLength,
          usages: final.usages as ImageUsageValue[],
          keepAfterLeave: final.keepAfterLeave,
          signedAt: confirmedAt,
          source: "ONLINE_GUARDIAN",
          textVersion: IMAGE_CONSENT_TEXT_VERSION,
          signerName: guardianName,
          signerQuality: relation,
          memberBirthDate: m.birthDate,
          memberWishes: { usages: [...wishes.usages], keepAfterLeave: wishes.keepAfterLeave },
        },
        select: { id: true },
      });
      await tx.user.update({
        where: { id: req.userId },
        data: { imageConsent: consentFromUsages(final.usages), imageConsentAt: confirmedAt },
        select: { id: true },
      });
    });
  } catch (err) {
    await removeObject(key);
    throw err;
  }

  const logFail = (what: string) => (err: unknown) =>
    console.error(`[droit à l'image] ${what} non envoyé :`, err instanceof Error ? err.message : err);
  await sendImageConsentNotice({
    userId: req.userId,
    memberName,
    via: `en ligne par son parent référent (${relation})`,
    usages: final.usages,
    previousUsages: previous,
    guardianChanges: changes,
  }).catch(logFail("avis au club"));
  await sendGuardianConsentResultToMember({
    to: m.email,
    memberName: m.firstName?.trim() || memberName,
    guardianName,
    usages: final.usages,
    changes,
  }).catch(logFail("e-mail au membre"));

  return { changes };
}

/** Pour le profil du mineur : la demande en cours (adresse masquée), ou null. */
export async function pendingGuardianRequest(prisma: PrismaClient, userId: string) {
  const req = await prisma.imageConsentRequest.findUnique({
    where: { userId },
    select: { usages: true, keepAfterLeave: true, sentTo: true, sentAt: true, expiresAt: true },
  });
  if (!req) return null;
  return {
    usages: req.usages,
    keepAfterLeave: req.keepAfterLeave,
    sentToMasked: req.sentTo ? maskEmail(req.sentTo) : null,
    sentAt: req.sentAt,
    expiresAt: req.expiresAt,
    /** Lien envoyé et encore valable. */
    active: Boolean(req.expiresAt && req.expiresAt.getTime() > Date.now()),
  };
}
