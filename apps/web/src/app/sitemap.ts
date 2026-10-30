import type { MetadataRoute } from "next";

import { prisma } from "@backend/prisma";

import { SITE_URL } from "@/config/siteUrl";
import { PAGE_REGISTRY } from "@/config/pageRegistry";

/**
 * sitemap.xml généré par Next.
 *
 * Rassemble les routes publiques du site vitrine :
 *  - 4 pages ÉDITORIALES (accueil, association, contacts, inscription) — listées seulement
 *    si PUBLIÉES (PageVisibility) : une page en brouillon rend « en
 *    construction » côté public, l'annoncer aux moteurs serait contre-productif.
 *  - 3 pages TOUJOURS PUBLIQUES (instructeurs, galerie, agenda).
 *  - les CONTENUS dynamiques PUBLIÉS : séminaires, disciplines, events.
 *
 * Règle de publication d'un contenu dynamique : slug non nul, publicationDate
 * non nulle et <= maintenant (un contenu daté dans le futur est programmé, pas
 * encore public → non indexé). lastModified = publicationDate.
 *
 * Les routes réservées aux membres (documents, profil, espaces) et utilitaires
 * (course, infos légales) sont exclues.
 */
export const dynamic = "force-dynamic";

/** Les pages éditoriales : le registre partagé avec le centre de contrôle et la route des fichiers. */
const EDITORIAL = PAGE_REGISTRY;

const abs = (path: string): string =>
  path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;

/**
 * Sélection commune : publié = slug + publicationDate (passée).
 *
 * Calculée à CHAQUE requête : une constante de module figerait « maintenant » au démarrage du
 * serveur, et un contenu programmé n'entrerait jamais dans le plan du site avant le redémarrage.
 */
function publishedWhere(now: Date) {
  return {
    slug: { not: null },
    publicationDate: { not: null, lte: now },
  } as const;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Toujours publiques (pas de gate éditorial).
  const alwaysPublic: MetadataRoute.Sitemap = [
    { url: abs("/about/instructeurs"), lastModified: now },
    { url: abs("/gallery"), lastModified: now },
    { url: abs("/agenda"), lastModified: now },
  ];

  // Pages éditoriales : incluses uniquement si publiées.
  const rows = await prisma.pageVisibility.findMany({
    where: { key: { in: EDITORIAL.map((e) => e.key) }, published: true },
    select: { key: true, updatedAt: true },
  });
  const publishedAt = new Map(rows.map((r) => [r.key, r.updatedAt] as const));

  const editorialEntries: MetadataRoute.Sitemap = EDITORIAL.filter((e) =>
    publishedAt.has(e.key),
  ).map((e) => ({
    url: abs(e.path),
    lastModified: publishedAt.get(e.key) ?? now,
  }));

  // Contenus dynamiques publiés (séminaires, disciplines, events).
  const [seminars, disciplines, events] = await Promise.all([
    prisma.seminar.findMany({
      where: publishedWhere(now),
      select: { slug: true, publicationDate: true },
    }),
    prisma.discipline.findMany({
      where: publishedWhere(now),
      select: { slug: true, publicationDate: true },
    }),
    prisma.event.findMany({
      where: publishedWhere(now),
      select: { slug: true, publicationDate: true },
    }),
  ]);

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...seminars.map((s) => ({
      url: abs(`/seminars/${s.slug}`),
      lastModified: s.publicationDate ?? now,
    })),
    ...disciplines.map((d) => ({
      url: abs(`/disciplines/${d.slug}`),
      lastModified: d.publicationDate ?? now,
    })),
    ...events.map((e) => ({
      url: abs(`/events/${e.slug}`),
      lastModified: e.publicationDate ?? now,
    })),
  ];

  return [...editorialEntries, ...alwaysPublic, ...dynamicEntries];
}
