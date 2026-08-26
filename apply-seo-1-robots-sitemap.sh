#!/usr/bin/env bash
#
# AKFC — Indexation (SEO) incrément 1 : robots.txt + sitemap.xml + métadonnées.
#
# CONSTAT : le site en prod n'expose NI robots.txt NI sitemap.xml, et les
# métadonnées racine se limitent à un titre + une description (pas de
# `metadataBase`, donc les URLs Open Graph/canoniques ne peuvent pas être
# absolues, et aucun sitemap n'est annoncé aux moteurs). Aucun `noindex`
# résiduel n'a été trouvé — le site est indexable, il n'était juste pas
# « déclaré ».
#
# FIX (incrément 1, STATIQUE + éditorial gaté) :
#   1. src/config/siteUrl.ts     — source unique de l'URL absolue du site.
#   2. src/app/robots.ts         — autorise l'indexation, exclut les espaces
#                                  privés (dashboard/profil/documents/espaces),
#                                  déclare le sitemap.
#   3. src/app/sitemap.ts        — routes publiques stables ; les 3 pages
#                                  éditoriales (accueil/association/contacts) ne
#                                  sont listées que si PUBLIÉES (une page en
#                                  brouillon rend « en construction » pour les
#                                  visiteurs — l'annoncer serait contre-productif).
#   4. src/app/layout.tsx        — metadataBase + robots:{index,follow} + gabarit
#                                  de titre « %s · AKFC ».
#
# HORS PÉRIMÈTRE (incrément 2 à venir) : enrichir le sitemap avec les CONTENUS
# dynamiques PUBLIÉS (disciplines, events, stages). Distinct aussi de la page
# « plan du site » lisible sous le menu Documentation (tâche séparée).
#
# URL de prod = https://akfc.fr (surchargeable par NEXT_PUBLIC_SITE_URL).
#
# Prérequis : aucun (le modèle PageVisibility existe déjà). Testable.
# Usage : bash apply-seo-1-robots-sitemap.sh
#         AKFC_APPLY_ONLY=1 bash apply-seo-1-robots-sitemap.sh   (clone)
#
set -euo pipefail

CFG="apps/web/src/config/siteUrl.ts"
ROBOTS="apps/web/src/app/robots.ts"
SITEMAP="apps/web/src/app/sitemap.ts"
LAYOUT="apps/web/src/app/layout.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$LAYOUT" ]      || { echo "ERREUR: $LAYOUT introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. L'indexation est une amélioration autonome —"
    echo "      elle peut aller sur main, ou sur une petite branche si tu préfères."
    echo "      (Ctrl-C pour annuler.)"
    sleep 2
  fi
fi

# ── 1. Source unique de l'URL absolue ───────────────────────────────────────
cat > "$CFG" <<'TS'
/**
 * URL absolue du site en production — source UNIQUE pour les métadonnées SEO
 * (`metadataBase`), le robots.txt et le sitemap.xml.
 *
 * Surchargeable par `NEXT_PUBLIC_SITE_URL` (préprod, domaine alternatif) ;
 * défaut = domaine de prod. Le slash final est retiré pour composer des URLs
 * propres (`${SITE_URL}/gallery`).
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://akfc.fr"
).replace(/\/+$/, "");
TS
echo "écrit  $CFG"

# ── 2. robots.txt ────────────────────────────────────────────────────────────
cat > "$ROBOTS" <<'TS'
import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/siteUrl";

/**
 * robots.txt généré par Next.
 *
 * Autorise l'indexation du site vitrine, exclut les espaces PRIVÉS ou
 * fonctionnels (tableau de bord, profil, documents membres, espaces
 * collaboratifs, placeholder « en construction », API), et déclare le sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/profil",
        "/documents",
        "/mes-espaces",
        "/en-construction",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
TS
echo "écrit  $ROBOTS"

# ── 3. sitemap.xml ───────────────────────────────────────────────────────────
cat > "$SITEMAP" <<'TS'
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
TS
echo "écrit  $SITEMAP"

# ── 4. Métadonnées racine (metadataBase + robots + gabarit de titre) ─────────
python3 - "$LAYOUT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# 4a. import de SITE_URL (idempotent)
imp = 'import { SITE_URL } from "@/config/siteUrl";\n'
if "@/config/siteUrl" not in s:
    anchor_imp = 'import type { Metadata } from "next"\n'
    assert s.count(anchor_imp) == 1, "ancre import Metadata introuvable/multiple"
    s = s.replace(anchor_imp, anchor_imp + imp)

# 4b. bloc metadata (idempotent : ne re-patche pas si metadataBase déjà là)
if "metadataBase" not in s:
    old = (
        'export const metadata: Metadata = {\n'
        '  title: "AKFC",\n'
        '  description: "Association de Kung Fu de Chambéry",\n'
        '}\n'
    )
    assert s.count(old) == 1, "ancre bloc metadata introuvable/multiple"
    new = (
        'export const metadata: Metadata = {\n'
        '  metadataBase: new URL(SITE_URL),\n'
        '  title: { default: "AKFC", template: "%s · AKFC" },\n'
        '  description: "Association de Kung Fu de Chambéry",\n'
        '  robots: { index: true, follow: true },\n'
        '}\n'
    )
    s = s.replace(old, new)

p.write_text(s, encoding="utf-8")
print("patché", sys.argv[1])
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(seo): robots.txt + sitemap.xml + metadataBase (site indexable, sitemap éditorial gaté sur publication)" \
  && echo "commit $(git rev-parse --short HEAD)"