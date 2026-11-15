import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { sendBirthDateLink, sendBirthDateUpdatedToMember } from "#email/templates/birthDateRequest.ts";
import { TOKEN_PATTERN, hashToken, linkInvalid } from "#modules/imageConsent/imageConsentGuardian.service.ts";
import { fullName, maskEmail, memberSelect } from "#modules/imageConsent/imageConsentOnline.service.ts";
import { makeAdult } from "#modules/users/comingOfAge.service.ts";
import {
  ADULT_BIRTH_DATE_UNCONFIRMED,
  GUARDIAN_LINK_COOLDOWN_MS,
  GUARDIAN_LINK_TTL_MS,
  effectiveLegalAge,
  parseGuardianBirthDate,
} from "@akfc/contracts/legal/imageConsent.ts";

/**
 * Date de naissance d'un membre MINEUR, renseignée, corrigée ou effacée par son parent référent.
 *
 * Le mineur ne peut pas modifier sa date (profil verrouillé) : il DEMANDE à son parent
 * (`requestBirthDateFromGuardian`), qui reçoit un lien personnel, à usage unique, valable 7 jours
 * (empreinte du jeton seule en base, comme pour le droit à l'image). Sur la page du lien
 * (`birthDateRequestByToken`), le parent valide (`confirmBirthDateByGuardian`) :
 * - une date de mineur : enregistrée, vérifiée (c'est elle qui fera passer le membre majeur) ;
 * - aucune date : celle de la fiche est effacée (le passage à 18 ans ne sera plus automatique) ;
 * - une date de majeur : refusée tant que le parent ne la confirme pas ; confirmée, le membre
 *   passe majeur (`makeAdult`) et décide seul.
 * Le droit à l'image n'est pas touché.
 */

async function loadMinorWithGuardian(prisma: PrismaClient, userId: string) {
  const m = await prisma.user.findUnique({ where: { id: userId }, select: memberSelect });
  if (!m) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
  if (effectiveLegalAge(m) !== "MINOR") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Ce circuit concerne les membres mineurs." });
  }
  if (!m.guardianName?.trim() || !m.guardianEmail) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Le club doit d'abord renseigner votre parent référent." });
  }
  return m;
}

/** Le mineur, connecté : un lien à son parent référent. Un nouveau lien grille le précédent. */
export async function requestBirthDateFromGuardian(prisma: PrismaClient, userId: string) {
  const m = await loadMinorWithGuardian(prisma, userId);
  const existing = await prisma.birthDateRequest.findUnique({ where: { userId }, select: { sentAt: true } });
  if (existing && Date.now() - existing.sentAt.getTime() < GUARDIAN_LINK_COOLDOWN_MS) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Un lien vient d'être envoyé : réessayez dans quelques minutes." });
  }
  const token = crypto.randomBytes(32).toString("base64url");
  const sentAt = new Date();
  const expiresAt = new Date(sentAt.getTime() + GUARDIAN_LINK_TTL_MS);
  const to = m.guardianEmail as string;
  const data = { tokenHash: hashToken(token), sentTo: to, sentAt, expiresAt };
  await prisma.birthDateRequest.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  try {
    await sendBirthDateLink({
      to,
      guardianName: (m.guardianName as string).trim(),
      memberName: fullName(m),
      token,
      expiresAt,
      hasDate: m.birthDate !== null,
    });
  } catch (err) {
    // Lien jamais parti : on ne laisse pas croire qu'il attend le parent.
    await prisma.birthDateRequest.deleteMany({ where: { userId } });
    console.error("[date de naissance] lien au parent non envoyé :", err instanceof Error ? err.message : err);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "L'e-mail à votre parent n'a pas pu partir. Réessayez plus tard." });
  }
  return { sentToMasked: maskEmail(to), expiresAt };
}

/** Profil du mineur : la demande en cours (adresse masquée), ou null. */
export async function pendingBirthDateRequest(prisma: PrismaClient, userId: string) {
  const req = await prisma.birthDateRequest.findUnique({ where: { userId }, select: { sentTo: true, expiresAt: true } });
  if (!req || req.expiresAt.getTime() <= Date.now()) return null;
  return { sentToMasked: maskEmail(req.sentTo), expiresAt: req.expiresAt };
}

async function findByToken(prisma: PrismaClient, token: string) {
  if (!TOKEN_PATTERN.test(token)) linkInvalid();
  const req = await prisma.birthDateRequest.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, tokenHash: true, expiresAt: true, user: { select: memberSelect } },
  });
  if (!req || req.expiresAt.getTime() <= Date.now()) linkInvalid();
  return req;
}

/** Page du parent : ce qu'il faut afficher (jamais d'adresse e-mail). */
export async function birthDateRequestByToken(prisma: PrismaClient, token: string) {
  const req = await findByToken(prisma, token);
  const m = req.user;
  return {
    memberName: fullName(m),
    guardianName: m.guardianName ?? "",
    guardianRelation: m.guardianRelation ?? "",
    /** Date enregistrée (« AAAA-MM-JJ »), ou null. */
    birthDate: m.birthDate ? m.birthDate.toISOString().slice(0, 10) : null,
    expiresAt: req.expiresAt,
    /** Devenu majeur entre-temps : le parent n'a plus rien à faire. */
    stillMinor: effectiveLegalAge(m) === "MINOR",
  };
}

/** Le parent valide la date (ou l'efface). Usage unique. */
export async function confirmBirthDateByGuardian(params: {
  prisma: PrismaClient;
  token: string;
  /** « AAAA-MM-JJ », ou null pour effacer la date enregistrée. */
  birthDate: string | null;
  /** Le parent confirme une date qui fait du membre un majeur. */
  confirmAdult?: boolean;
}): Promise<{ result: "SET" | "CLEARED" | "ADULT" }> {
  const { prisma } = params;
  const req = await findByToken(prisma, params.token);
  const m = req.user;
  if (effectiveLegalAge(m) !== "MINOR") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Ce membre est devenu majeur : il gère désormais lui-même son compte." });
  }
  const given = params.birthDate ? parseGuardianBirthDate(params.birthDate) : null;
  if (typeof given === "string") throw new TRPCError({ code: "BAD_REQUEST", message: given });
  if (!given && !m.birthDate) throw new TRPCError({ code: "BAD_REQUEST", message: "Indiquez sa date de naissance." });
  if (given?.adult) {
    if (!params.confirmAdult) throw new TRPCError({ code: "BAD_REQUEST", message: ADULT_BIRTH_DATE_UNCONFIRMED });
    await makeAdult(prisma, req.userId, { birthDate: given.date });
    return { result: "ADULT" };
  }
  await prisma.$transaction(async (tx) => {
    // Usage unique, même en double clic : la seconde validation ne trouve plus la demande.
    const { count } = await tx.birthDateRequest.deleteMany({ where: { id: req.id, tokenHash: req.tokenHash } });
    if (count !== 1) linkInvalid();
    await tx.user.update({
      where: { id: req.userId },
      data: given ? { birthDate: given.date, birthDateVerified: true } : { birthDate: null, birthDateVerified: false },
      select: { id: true },
    });
  });
  await sendBirthDateUpdatedToMember({
    to: m.email,
    firstName: m.firstName?.trim() || fullName(m),
    guardianName: (m.guardianName ?? "").trim(),
    cleared: !given,
  }).catch((err) => console.error("[date de naissance] e-mail au membre non envoyé :", err instanceof Error ? err.message : err));
  return { result: given ? "SET" : "CLEARED" };
}
