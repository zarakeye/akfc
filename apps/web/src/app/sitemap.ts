import type { MetadataRoute } from "next";

import { prisma } from "@backend/prisma";

import { SITE_URL } from "@/config/siteUrl";

/**
 * sitemap.xml généré par Next.
 *
 * Rassemble les routes publiques STABLES du site vitrine. Les 3 pages
 * éditoriales (accueil, association, contacts) ne sont listées que si elles
 * sont PUBLIÉES : une page en brouillon rend « en construction » pour les
 * visiteurs, l'annoncer aux moteurs serait contre-productif. Les routes
 * réservées aux membres (documents, profil, espaces) sont exclues, et les
 * CONTENUS dynamiques publiés (disciplines, events, stages) viendront enrichir
 * ce sitemap à l'incrément suivant.
 */
export const dynamic = "force-dynamic";

type Editorial = { key: string; path: string };

const EDITORIAL: readonly Editorial[] = [
  { key: "home", path: "/" },
  { key: "association", path: "/about" },
  { key: "contacts", path: "/contacts" },
] as const;

const abs = (path: string): string =>
  path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;

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

  return [...editorialEntries, ...alwaysPublic];
}
