import type { PrismaClient } from "@prisma/client";

import { CAROUSEL_SLUG, dueTagDigests } from "@contracts/legal/mediaPeople";
import { sendMediaTagDigest } from "@backend/email/templates/mediaTagDigest";
import { isDemoEmail } from "@backend/lib/demoAccounts";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import { deriveMediaKind } from "@backend/modules/media/helpers/deriveMediaKind";
import { NO_CONSENT, consentOf, mediaVerdictsFor, statesOf } from "@backend/modules/mediaPeople/mediaPeople.service";
import { KIND_LABEL, pageTitles } from "@backend/modules/mediaPeople/publicRightsReport.service";

/**
 * « Où j'apparais » : les médias où le membre connecté a été tagué, où ils sont montrés, et ce que
 * son droit à l'image en permet. C'est son droit d'accès (RGPD, art. 15) : il voit ces médias même
 * s'ils ne sont pas publiés (`canReadStorageKey` les lui ouvre).
 */
export async function myAppearances(prisma: PrismaClient, userId: string) {
  const tags = await prisma.mediaPerson.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      mediaAssetId: true,
      createdAt: true,
      refusedAt: true,
      mediaAsset: { select: { fullPath: true, originalFileName: true, mimeType: true } },
    },
  });
  const ids = tags.map((t) => t.mediaAssetId);
  const [consents, verdicts, items, refs] = await Promise.all([
    consentOf(prisma, [userId]),
    mediaVerdictsFor(prisma, ids),
    prisma.galleryItem.findMany({
      where: { mediaAssetId: { in: ids } },
      select: { mediaAssetId: true, gallery: { select: { title: true, slug: true, visibility: true } } },
    }),
    prisma.pageMediaReference.findMany({
      where: { mediaAssetId: { in: ids } },
      select: { mediaAssetId: true, pageType: true, pageId: true },
    }),
  ]);
  const titles = await pageTitles(prisma, refs);
  const consent = consents.get(userId) ?? NO_CONSENT;

  const shownOn = new Map<string, string[]>();
  const add = (id: string, label: string): void => {
    const list = shownOn.get(id) ?? [];
    if (!list.includes(label)) list.push(label);
    shownOn.set(id, list);
  };
  for (const it of items) {
    add(
      it.mediaAssetId,
      it.gallery.slug === CAROUSEL_SLUG
        ? "Carrousel de la page d'accueil"
        : `Galerie « ${it.gallery.title} »${it.gallery.visibility === "MEMBERS" ? " (espace membres)" : ""}`,
    );
  }
  for (const r of refs) {
    add(r.mediaAssetId, `${KIND_LABEL[r.pageType]} « ${titles.get(`${r.pageType}:${r.pageId}`)?.title ?? r.pageId} »`);
  }

  return {
    /** Mon état pour chaque usage, et d'où il vient (formulaire, statut saisi par le club, rien). */
    states: statesOf(consent),
    source: consent.formUsages ? ("FORM" as const) : consent.status === "UNKNOWN" ? ("NONE" as const) : ("STATUS" as const),
    items: tags.map((t) => {
      const url = buildMediaProxyUrl({ fullPath: t.mediaAsset.fullPath });
      return {
        mediaAssetId: t.mediaAssetId,
        fileName: t.mediaAsset.originalFileName,
        thumbUrl: deriveMediaKind(t.mediaAsset.mimeType) === "video" ? `${url}&as=poster` : url,
        taggedAt: t.createdAt,
        /** J'ai refusé la diffusion de ce média : il n'est montré nulle part. */
        refusedByMe: t.refusedAt !== null,
        shownOn: shownOn.get(t.mediaAssetId) ?? [],
        /** Masqué sur le site public : une personne taguée (moi, ou une autre) a refusé. */
        hiddenOnPublicSite: verdicts[t.mediaAssetId]?.verdicts.PUBLIC_SITE === "REFUSED",
      };
    }),
  };
}

/**
 * Prévient les personnes taguées (voir `dueTagDigests`) : un e-mail, puis leurs tags sont marqués
 * annoncés. Un compte de démonstration est marqué sans e-mail. Renvoie le nombre d'e-mails envoyés.
 */
export async function sendTagDigests(prisma: PrismaClient, now: Date = new Date()): Promise<number> {
  const pendingUsers = await prisma.mediaPerson.findMany({
    where: { notifiedAt: null },
    distinct: ["userId"],
    select: { userId: true },
  });
  if (pendingUsers.length === 0) return 0;
  const tags = await prisma.mediaPerson.findMany({
    where: { userId: { in: pendingUsers.map((p) => p.userId) } },
    select: { userId: true, createdAt: true, notifiedAt: true },
  });
  let sent = 0;
  for (const [userId, count] of dueTagDigests(tags, now)) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } });
    if (!u) continue;
    if (!isDemoEmail(u.email)) {
      await sendMediaTagDigest({ to: u.email, firstName: u.firstName?.trim() ?? "", count });
      sent += 1;
    }
    await prisma.mediaPerson.updateMany({ where: { userId, notifiedAt: null }, data: { notifiedAt: now } });
  }
  return sent;
}

let digestTimer: ReturnType<typeof setInterval> | null = null;

/** Toutes les 5 minutes, en tâche de fond (désactivable : MEDIA_TAG_DIGEST_DISABLED=1). */
export function startTagDigestSchedule(prisma: PrismaClient): boolean {
  if (process.env.MEDIA_TAG_DIGEST_DISABLED === "1" || digestTimer) return false;
  let busy = false;
  digestTimer = setInterval(() => {
    if (busy) return;
    busy = true;
    sendTagDigests(prisma)
      .then((n) => { if (n) console.log(`[tags] ${n} personne(s) prévenue(s)`); })
      .catch((err) => console.error("[tags] échec des e-mails :", err instanceof Error ? err.message : err))
      .finally(() => { busy = false; });
  }, 5 * 60_000);
  return true;
}
