#!/usr/bin/env bash
#
# AKFC — SEO : enrichit sitemap.ts avec les contenus dynamiques publiés.
#
# Garde l'existant (3 éditoriales gatées + 3 « toujours publiques ») et ajoute
# les fiches PUBLIÉES : séminaires, disciplines, events. Règle de publication :
#   slug != null ET publicationDate != null ET publicationDate <= maintenant
# (le <= now évite d'exposer un contenu programmé dans le futur).
# URLs : /seminars/<slug>, /disciplines/<slug>, /events/<slug>
# (cohérent avec les 301 /stages→/seminars). lastModified = publicationDate.
#
# Exclus (volontaire) : /course/[id] (créneaux, ni slug ni publication),
# /infos/[slug] (SitePage légales, pas de flag publié).
#
# Périmètre : apps/web/src/app/sitemap.ts. Un typecheck.
# Usage : bash apply-sitemap-dynamic-entries.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/app/sitemap.ts"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if grep -q 'prisma.seminar.findMany' "$F" 2>/dev/null; then echo "— déjà enrichi"; exit 0; fi

cat > "$F" <<'TSX'
import type { MetadataRoute } from "next";

import { prisma } from "@backend/prisma";

import { SITE_URL } from "@/config/siteUrl";

/**
 * sitemap.xml généré par Next.
 *
 * Rassemble les routes publiques du site vitrine :
 *  - 3 pages ÉDITORIALES (accueil, association, contacts) — listées seulement
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

type Editorial = { key: string; path: string };

const EDITORIAL: readonly Editorial[] = [
  { key: "home", path: "/" },
  { key: "association", path: "/about" },
  { key: "contacts", path: "/contacts" },
] as const;

const abs = (path: string): string =>
  path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;

/** Sélection commune : publié = slug + publicationDate (passée). */
const publishedWhere = {
  slug: { not: null },
  publicationDate: { not: null, lte: new Date() },
} as const;

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
      where: publishedWhere,
      select: { slug: true, publicationDate: true },
    }),
    prisma.discipline.findMany({
      where: publishedWhere,
      select: { slug: true, publicationDate: true },
    }),
    prisma.event.findMany({
      where: publishedWhere,
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
TSX
echo "  ok  sitemap.ts"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
git commit -m "feat(seo): sitemap enrichi — séminaires/disciplines/events publiés" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }