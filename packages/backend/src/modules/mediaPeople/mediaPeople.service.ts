import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { sendImageConsentReminder } from "@backend/email/templates/imageConsentReminder";
import { byEffectiveDesc } from "@backend/modules/imageConsent/formOrder";
import { resendGuardianLink } from "@backend/modules/imageConsent/imageConsentGuardian.service";
import { maskEmail } from "@backend/modules/imageConsent/imageConsentOnline.service";
import { IMAGE_USAGE_VALUES, effectiveLegalAge, type ImageUsageValue } from "@contracts/legal/imageConsent";
import {
  IMAGE_CONSENT_REMINDER_COOLDOWN_MS,
  blockingMessage,
  checkDestinations,
  galleryAlternative,
  galleryDestinations,
  mediaVerdicts,
  personUsageState,
  type PersonConsent,
  type PersonUsageState,
} from "@contracts/legal/mediaPeople";

/**
 * Tags de personnes sur les médias (administrateurs) : qui apparaît sur quel média, et ce que leur
 * droit à l'image ACTUEL permet, usage par usage. Les verdicts ne sont jamais stockés.
 */

/** Droit à l'image de chaque personne : formulaire le plus récent, sinon statut saisi par le club. */
export async function consentOf(prisma: PrismaClient, userIds: readonly string[]): Promise<Map<string, PersonConsent>> {
  const ids = [...new Set(userIds)];
  if (ids.length === 0) return new Map();
  const [users, forms] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, imageConsent: true } }),
    prisma.imageConsentForm.findMany({
      where: { userId: { in: ids } },
      select: { userId: true, usages: true, signedAt: true, createdAt: true },
    }),
  ]);
  const latest = new Map<string, ImageUsageValue[]>();
  for (const f of [...forms].sort(byEffectiveDesc)) {
    if (f.userId && !latest.has(f.userId)) latest.set(f.userId, f.usages);
  }
  return new Map(users.map((u) => [u.id, { formUsages: latest.get(u.id) ?? null, status: u.imageConsent }]));
}

const fullName = (u: { firstName: string | null; lastName: string | null; email: string }): string =>
  [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;

async function assertMedia(prisma: PrismaClient, mediaAssetId: string) {
  const m = await prisma.mediaAsset.findUnique({ where: { id: mediaAssetId }, select: { id: true, noRecognizablePerson: true } });
  if (!m) throw new TRPCError({ code: "NOT_FOUND", message: "Média introuvable." });
  return m;
}

export const NO_CONSENT: PersonConsent = { formUsages: null, status: "UNKNOWN" };

/** État d'une personne pour chacun des usages. */
export function statesOf(c: PersonConsent): Record<ImageUsageValue, PersonUsageState> {
  return Object.fromEntries(IMAGE_USAGE_VALUES.map((u) => [u, personUsageState(c, u)])) as Record<
    ImageUsageValue,
    PersonUsageState
  >;
}

/**
 * Membres que l'on peut taguer (liste de la modale), avec l'état de leur droit à l'image usage par
 * usage : l'administrateur voit, avant même de cocher, qui fera passer la photo au rouge.
 */
export async function tagCandidates(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { email: "asc" }],
    select: { id: true, email: true, firstName: true, lastName: true, legalAge: true, birthDate: true, birthDateVerified: true },
  });
  const consents = await consentOf(prisma, users.map((u) => u.id));
  return users.map((u) => ({
    id: u.id,
    name: fullName(u),
    email: u.email,
    legalAge: effectiveLegalAge(u),
    states: statesOf(consents.get(u.id) ?? NO_CONSENT),
  }));
}

/** Un média : les personnes taguées, leur état usage par usage, et le verdict. */
export async function mediaPeopleFor(prisma: PrismaClient, mediaAssetId: string) {
  const media = await assertMedia(prisma, mediaAssetId);
  const tags = await prisma.mediaPerson.findMany({
    where: { mediaAssetId },
    orderBy: { createdAt: "asc" },
    select: {
      userId: true,
      createdAt: true,
      refusedAt: true,
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          legalAge: true,
          birthDate: true,
          birthDateVerified: true,
          imageConsentRemindedAt: true,
        },
      },
    },
  });
  const consents = await consentOf(prisma, tags.map((t) => t.userId));
  // Le droit à l'image de chacun POUR CE MÉDIA : son autorisation générale, sauf refus de ce média.
  const consentHere = (t: { userId: string; refusedAt: Date | null }): PersonConsent => ({
    ...(consents.get(t.userId) ?? NO_CONSENT),
    refusedThisMedia: t.refusedAt !== null,
  });
  const people = tags.map((t) => {
    const c = consentHere(t);
    const states = statesOf(c);
    const remindedAt = t.user.imageConsentRemindedAt;
    return {
      userId: t.userId,
      name: fullName(t.user),
      legalAge: effectiveLegalAge(t.user),
      /** D'où vient l'état : le formulaire le plus récent, le statut saisi à la main, ou rien. */
      source: c.formUsages ? ("FORM" as const) : c.status === "UNKNOWN" ? ("NONE" as const) : ("STATUS" as const),
      states,
      /** Elle a refusé ce média précis (« Où j'apparais ») : rouge partout, quelle que soit son autorisation. */
      refusedThisMedia: t.refusedAt !== null,
      taggedAt: t.createdAt,
      remindedAt,
      /** Relance possible : au moins un usage sans autorisation, et pas de relance depuis 7 jours. */
      canRemind:
        Object.values(states).includes("MISSING") &&
        (!remindedAt || Date.now() - remindedAt.getTime() >= IMAGE_CONSENT_REMINDER_COOLDOWN_MS),
    };
  });
  return {
    mediaAssetId,
    noRecognizablePerson: media.noRecognizablePerson,
    people,
    verdicts: mediaVerdicts({ people: tags.map(consentHere), noRecognizablePerson: media.noRecognizablePerson }),
  };
}

/** Remplace la liste des personnes taguées sur un média (les tags déjà posés gardent leur date). */
export async function setMediaPeople(
  prisma: PrismaClient,
  params: { mediaAssetId: string; userIds: readonly string[]; adminId: string },
) {
  await assertMedia(prisma, params.mediaAssetId);
  const wanted = [...new Set(params.userIds)];
  const found = await prisma.user.count({ where: { id: { in: wanted } } });
  if (found !== wanted.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Un des membres est introuvable." });
  await prisma.$transaction([
    prisma.mediaPerson.deleteMany({ where: { mediaAssetId: params.mediaAssetId, userId: { notIn: wanted } } }),
    prisma.mediaPerson.createMany({
      data: wanted.map((userId) => ({ mediaAssetId: params.mediaAssetId, userId, taggedById: params.adminId })),
      skipDuplicates: true,
    }),
  ]);
  return mediaPeopleFor(prisma, params.mediaAssetId);
}

/** « Aucune personne reconnaissable » : vert partout, tant qu'on n'a pas tagué quelqu'un. */
export async function setNoRecognizablePerson(prisma: PrismaClient, mediaAssetId: string, value: boolean) {
  await assertMedia(prisma, mediaAssetId);
  await prisma.mediaAsset.update({ where: { id: mediaAssetId }, data: { noRecognizablePerson: value }, select: { id: true } });
  return mediaPeopleFor(prisma, mediaAssetId);
}

/** Verdicts de plusieurs médias d'un coup (tableau d'une galerie) : nombre de personnes et pastilles. */
export async function mediaVerdictsFor(prisma: PrismaClient, mediaAssetIds: readonly string[]) {
  const ids = [...new Set(mediaAssetIds)];
  const [medias, tags] = await Promise.all([
    prisma.mediaAsset.findMany({ where: { id: { in: ids } }, select: { id: true, noRecognizablePerson: true } }),
    prisma.mediaPerson.findMany({
      where: { mediaAssetId: { in: ids } },
      select: { mediaAssetId: true, userId: true, refusedAt: true },
    }),
  ]);
  const consents = await consentOf(prisma, tags.map((t) => t.userId));
  return Object.fromEntries(
    medias.map((m) => {
      const people = tags
        .filter((t) => t.mediaAssetId === m.id)
        .map((t) => ({ ...consents.get(t.userId)!, refusedThisMedia: t.refusedAt !== null }));
      return [m.id, { count: people.length, noRecognizablePerson: m.noRecognizablePerson, verdicts: mediaVerdicts({ people, noRecognizablePerson: m.noRecognizablePerson }) }];
    }),
  );
}

/** Confronte des médias aux destinations d'un contenant (voir `checkDestinations`). */
export async function checkMediaDestinations(
  prisma: PrismaClient,
  mediaAssetIds: readonly string[],
  destinations: readonly ImageUsageValue[],
) {
  const v = await mediaVerdictsFor(prisma, mediaAssetIds);
  const verdicts = Object.fromEntries(Object.entries(v).map(([id, m]) => [id, m.verdicts]));
  return checkDestinations(verdicts, mediaAssetIds, destinations);
}

/**
 * Avant d'enregistrer les médias d'une galerie (ou du carrousel) : null si rien ne bloque, sinon le
 * message à afficher. Seul un REFUS d'une personne taguée bloque ; le reste avertit dans le tableau.
 */
export async function galleryRightsError(
  prisma: PrismaClient,
  gallery: { slug: string; visibility: "PUBLIC" | "MEMBERS" },
  mediaAssetIds: readonly string[],
): Promise<string | null> {
  const check = await checkMediaDestinations(prisma, mediaAssetIds, galleryDestinations(gallery));
  return check.blocking.length > 0 ? blockingMessage(mediaAssetIds, check.blocking, galleryAlternative(gallery.slug)) : null;
}

/**
 * Médias à masquer pour un usage : une personne taguée l'a refusé. Le contenant n'est pas modifié ;
 * l'affichage les saute, et ils reviennent si la personne change d'avis ou si on retire son tag.
 */
export async function refusedMediaIds(
  prisma: PrismaClient,
  mediaAssetIds: readonly string[],
  usage: ImageUsageValue,
): Promise<Set<string>> {
  if (mediaAssetIds.length === 0) return new Set();
  const v = await mediaVerdictsFor(prisma, mediaAssetIds);
  return new Set(Object.entries(v).filter(([, m]) => m.verdicts[usage] === "REFUSED").map(([id]) => id));
}

/**
 * Relance le droit à l'image d'une personne taguée (une fois au plus tous les 7 jours).
 * - Mineur dont le parent a déjà un lien en cours ou expiré : nouveau lien au parent.
 * - Mineur sans demande : e-mail au mineur, pour qu'il indique ses souhaits.
 * - Sinon : e-mail au membre, pour qu'il réponde en ligne.
 */
export async function remindImageConsent(prisma: PrismaClient, userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      firstName: true,
      legalAge: true,
      birthDate: true,
      birthDateVerified: true,
      imageConsentRemindedAt: true,
      imageConsentRequest: { select: { id: true } },
    },
  });
  if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
  if (u.imageConsentRemindedAt && Date.now() - u.imageConsentRemindedAt.getTime() < IMAGE_CONSENT_REMINDER_COOLDOWN_MS) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Ce membre a déjà été relancé ces 7 derniers jours." });
  }
  let result: { channel: "GUARDIAN_LINK" | "MEMBER_EMAIL"; sentToMasked: string };
  if (effectiveLegalAge(u) === "MINOR" && u.imageConsentRequest) {
    const r = await resendGuardianLink(prisma, userId);
    result = { channel: "GUARDIAN_LINK", sentToMasked: r.sentToMasked };
  } else {
    await sendImageConsentReminder({
      to: u.email,
      firstName: u.firstName?.trim() || "",
      kind: effectiveLegalAge(u) === "MINOR" ? "MINOR_WISHES" : "ADULT",
    });
    result = { channel: "MEMBER_EMAIL", sentToMasked: maskEmail(u.email) };
  }
  await prisma.user.update({ where: { id: userId }, data: { imageConsentRemindedAt: new Date() }, select: { id: true } });
  return result;
}

/**
 * « Je ne souhaite pas que cette photo soit diffusée » (ou l'annulation de ce refus), par la personne
 * taguée elle-même, depuis « Où j'apparais ». Seulement sur un média où elle est taguée.
 */
export async function setMyMediaRefusal(prisma: PrismaClient, userId: string, mediaAssetId: string, refused: boolean) {
  const { count } = await prisma.mediaPerson.updateMany({
    where: { userId, mediaAssetId },
    data: { refusedAt: refused ? new Date() : null },
  });
  if (count === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Vous n'êtes pas identifié(e) sur ce média." });
  return { refused };
}
