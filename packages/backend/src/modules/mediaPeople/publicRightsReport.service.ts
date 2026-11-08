import type { PageReferencerKind, PrismaClient } from "@prisma/client";

import { CAROUSEL_SLUG, type UsageVerdict } from "@contracts/legal/mediaPeople";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import { deriveMediaKind } from "@backend/modules/media/helpers/deriveMediaKind";
import { mediaVerdictsFor } from "@backend/modules/mediaPeople/mediaPeople.service";

/** Où un média est montré sur le site public, avec le lien vers sa fiche d'administration. */
export type PublicUsage = { label: string; href: string };

const KIND_LABEL: Record<PageReferencerKind, string> = {
  COURSE: "Cours",
  SEMINAR_DESCRIPTION: "Stage",
  SEMINAR_PROGRAM: "Stage (programme)",
  POST: "Actualité",
  DISCIPLINE: "Discipline",
  EVENT: "Évènement",
  SITE_PAGE: "Page",
  SEMINAR_SUMMARY: "Stage (résumé)",
  EVENT_SUMMARY: "Évènement (résumé)",
  INSTRUCTOR_BIO: "Présentation de",
};

/** Ordre du rapport : ce qui est masqué d'abord, puis ce qui attend une réponse, puis à taguer. */
const ORDER: Record<Exclude<UsageVerdict, "OK">, number> = { REFUSED: 0, MISSING: 1, UNTAGGED: 2 };

/**
 * Médias montrés sur le site PUBLIC (galeries publiques, carrousel, contenus des pages, images de
 * résumé) dont le droit à l'image demande une action : masqués (une personne taguée a refusé), en
 * attente (une personne taguée n'a pas répondu), ou à taguer. Les médias en règle n'y sont pas.
 *
 * L'usage public se lit dans deux registres déjà tenus : `PageMediaReference` (recensé à chaque
 * enregistrement d'un contenu, images de résumé comprises) et `GalleryItem` des galeries publiques.
 */
export async function publicRightsReport(prisma: PrismaClient) {
  const [refs, items] = await Promise.all([
    prisma.pageMediaReference.findMany({ select: { mediaAssetId: true, pageType: true, pageId: true } }),
    prisma.galleryItem.findMany({
      where: { gallery: { OR: [{ visibility: "PUBLIC" }, { slug: CAROUSEL_SLUG }] } },
      select: { mediaAssetId: true, gallery: { select: { id: true, title: true, slug: true } } },
    }),
  ]);

  const usages = new Map<string, PublicUsage[]>();
  const add = (id: string, u: PublicUsage): void => {
    const list = usages.get(id) ?? [];
    if (!list.some((x) => x.href === u.href)) list.push(u);
    usages.set(id, list);
  };
  for (const it of items) {
    add(it.mediaAssetId, {
      label: it.gallery.slug === CAROUSEL_SLUG ? "Carrousel d'accueil" : `Galerie « ${it.gallery.title} »`,
      href: `/dashboard/galleries/${it.gallery.id}/edit`,
    });
  }
  const titles = await pageTitles(prisma, refs);
  for (const r of refs) {
    const t = titles.get(`${r.pageType}:${r.pageId}`);
    add(r.mediaAssetId, {
      label: `${KIND_LABEL[r.pageType]} « ${t?.title ?? r.pageId} »`,
      href: t?.href ?? "/dashboard",
    });
  }

  const ids = [...usages.keys()];
  const [verdicts, assets] = await Promise.all([
    mediaVerdictsFor(prisma, ids),
    prisma.mediaAsset.findMany({
      where: { id: { in: ids } },
      select: { id: true, fullPath: true, originalFileName: true, mimeType: true },
    }),
  ]);

  return assets
    .flatMap((a) => {
      const v = verdicts[a.id];
      const verdict = v?.verdicts.PUBLIC_SITE ?? "UNTAGGED";
      if (verdict === "OK") return [];
      const url = buildMediaProxyUrl({ fullPath: a.fullPath });
      return [
        {
          mediaAssetId: a.id,
          fileName: a.originalFileName,
          thumbUrl: deriveMediaKind(a.mimeType) === "video" ? `${url}&as=poster` : url,
          verdict,
          people: v?.count ?? 0,
          usages: usages.get(a.id) ?? [],
        },
      ];
    })
    .sort((x, y) => ORDER[x.verdict] - ORDER[y.verdict] || x.fileName.localeCompare(y.fileName, "fr"));
}

/** Titre et lien d'administration de chaque contenu référencé (une requête par type). */
async function pageTitles(
  prisma: PrismaClient,
  refs: readonly { pageType: PageReferencerKind; pageId: string }[],
): Promise<Map<string, { title: string; href: string }>> {
  const idsOf = (...kinds: PageReferencerKind[]): number[] =>
    [...new Set(refs.filter((r) => kinds.includes(r.pageType)).map((r) => Number(r.pageId)))].filter(Number.isFinite);
  const keysOf = (kind: PageReferencerKind): string[] => [...new Set(refs.filter((r) => r.pageType === kind).map((r) => r.pageId))];

  const [courses, seminars, posts, disciplines, events, pages, instructors] = await Promise.all([
    prisma.course.findMany({ where: { id: { in: idsOf("COURSE") } }, select: { id: true, discipline: { select: { name: true } } } }),
    prisma.seminar.findMany({ where: { id: { in: idsOf("SEMINAR_DESCRIPTION", "SEMINAR_PROGRAM", "SEMINAR_SUMMARY") } }, select: { id: true, label: true } }),
    prisma.post.findMany({ where: { id: { in: idsOf("POST") } }, select: { id: true, title: true } }),
    prisma.discipline.findMany({ where: { id: { in: idsOf("DISCIPLINE") } }, select: { id: true, name: true } }),
    prisma.event.findMany({ where: { id: { in: idsOf("EVENT", "EVENT_SUMMARY") } }, select: { id: true, label: true } }),
    prisma.sitePage.findMany({ where: { slug: { in: keysOf("SITE_PAGE") } }, select: { slug: true, title: true } }),
    prisma.user.findMany({
      where: { id: { in: keysOf("INSTRUCTOR_BIO") } },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);

  const out = new Map<string, { title: string; href: string }>();
  for (const c of courses) out.set(`COURSE:${c.id}`, { title: c.discipline.name, href: `/dashboard/courses/${c.id}` });
  for (const s of seminars) {
    for (const k of ["SEMINAR_DESCRIPTION", "SEMINAR_PROGRAM", "SEMINAR_SUMMARY"]) {
      out.set(`${k}:${s.id}`, { title: s.label, href: `/dashboard/seminars/${s.id}` });
    }
  }
  for (const p of posts) out.set(`POST:${p.id}`, { title: p.title, href: `/dashboard/posts/${p.id}` });
  for (const d of disciplines) out.set(`DISCIPLINE:${d.id}`, { title: d.name, href: `/dashboard/disciplines/${d.id}` });
  for (const e of events) {
    out.set(`EVENT:${e.id}`, { title: e.label, href: `/dashboard/events/${e.id}` });
    out.set(`EVENT_SUMMARY:${e.id}`, { title: e.label, href: `/dashboard/events/${e.id}` });
  }
  for (const u of instructors) {
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
    out.set(`INSTRUCTOR_BIO:${u.id}`, { title: name, href: `/dashboard/users/${u.id}` });
  }
  for (const p of pages) out.set(`SITE_PAGE:${p.slug}`, { title: p.title, href: `/dashboard/site-pages/${p.slug}` });
  return out;
}
