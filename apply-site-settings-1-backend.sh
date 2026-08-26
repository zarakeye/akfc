#!/usr/bin/env bash
#
# AKFC — Réglages du site (CMS) incrément 1 : modèle + migration + router.
#
# OBJECTIF : sortir l'IDENTITÉ éditoriale du site du `.env` (réservé au dev)
# vers une ligne en base qu'un admin modifie depuis le control panel. On NE
# touche PAS aux identités techniques : `APP_SHORT_NAME` reste la RACINE DE
# STOCKAGE du finder/uploads (identité, doit rester « AKFC ») ; `shortTitle`
# ci-dessous n'est qu'un LIBELLÉ d'affichage. Les URL de déploiement, SMTP et
# clés cloud restent aussi dans le `.env`.
#
# CE QUE FAIT CET INCRÉMENT (backend seul, aucun consommateur encore branché) :
#   1. prisma/schema.prisma          — modèle `SiteSettings` (singleton id="site").
#   2. migration 20261023000000      — CREATE TABLE (écrite à la main ; le rôle
#                                      applicatif n'a pas CREATEDB → migrate deploy).
#   3. modules/siteSettings/router   — `get` (public) / `save` (protégé), calqué
#                                      sur homeHero / sitePage.save (pas de perm nommée).
#   4. modules/index.ts              — enregistrement `siteSettings`.
#
# Champs : shortTitle, longTitle, tagline?, supportEmail?, defaultLocale, logoAssetId?
#   — les optionnels sont nullable dès maintenant pour éviter une re-migration.
#   — logoAssetId : l'asset choisi devra être servi publiquement (garde média à
#     élargir à l'incrément « consommateurs »).
#
# À faire APRÈS application : `pnpm prisma generate` (le script le lance déjà
# hors APPLY_ONLY) puis `pnpm prisma migrate deploy` (local + serveur). C'est un
# CREATE TABLE d'une table NEUVE → pas de souci de propriétaire (contrairement
# aux ALTER sur les tables anciennes appartenant à `postgres`).
#
# Usage : bash apply-site-settings-1-backend.sh
#         AKFC_APPLY_ONLY=1 bash apply-site-settings-1-backend.sh   (clone)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
IDX="packages/backend/src/modules/index.ts"
ROUTER_DIR="packages/backend/src/modules/siteSettings"
ROUTER="$ROUTER_DIR/router.ts"
MIG_DIR="prisma/migrations/20261023000000_site_settings"
MIG="$MIG_DIR/migration.sql"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SCHEMA" ]      || { echo "ERREUR: $SCHEMA introuvable." >&2; exit 1; }
[ -f "$IDX" ]         || { echo "ERREUR: $IDX introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. Les réglages du site sont une feature autonome —"
    echo "      main convient, ou une petite branche si tu préfères. (Ctrl-C pour annuler.)"
    sleep 2
  fi
fi

# ── 1. Modèle Prisma (inséré après HomeHero) ────────────────────────────────
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "model SiteSettings" in s:
    print("déjà présent (SiteSettings)"); sys.exit(0)
anchor = (
    'model HomeHero {\n'
    '  id    String @id @default("home")\n'
    '  title String\n'
    '  body  String\n'
    '}\n'
)
assert s.count(anchor) == 1, "ancre model HomeHero introuvable/multiple"
model = (
    '\n'
    '/// Identité éditoriale du site (singleton, id="site").\n'
    '///\n'
    '/// Ce qu\'un admin peut changer sans toucher au code ni au .env. DISTINCT de\n'
    '/// `APP_SHORT_NAME` (racine de STOCKAGE du finder/uploads, identité technique)\n'
    '/// : `shortTitle` n\'est qu\'un LIBELLÉ d\'affichage (header, onglet, e-mails).\n'
    'model SiteSettings {\n'
    '  id            String   @id @default("site")\n'
    '  shortTitle    String   @default("AKFC")\n'
    '  longTitle     String   @default("Association de Kung Fu de Chambéry")\n'
    '  tagline       String?\n'
    '  supportEmail  String?\n'
    '  defaultLocale String   @default("fr")\n'
    '  /// Référence vers un MediaAsset (choisi au picker). null = logo embarqué.\n'
    '  /// L\'asset devra être servi publiquement (garde média à élargir côté conso).\n'
    '  logoAssetId   String?\n'
    '  updatedAt     DateTime @updatedAt\n'
    '}\n'
)
s = s.replace(anchor, anchor + model)
p.write_text(s, encoding="utf-8")
print("schema patché (SiteSettings)")
PY

# ── 2. Migration (CREATE TABLE) ──────────────────────────────────────────────
mkdir -p "$MIG_DIR"
cat > "$MIG" <<'SQL'
-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "shortTitle" TEXT NOT NULL DEFAULT 'AKFC',
    "longTitle" TEXT NOT NULL DEFAULT 'Association de Kung Fu de Chambéry',
    "tagline" TEXT,
    "supportEmail" TEXT,
    "defaultLocale" TEXT NOT NULL DEFAULT 'fr',
    "logoAssetId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
SQL
echo "écrit  $MIG"

# ── 3. Router (calqué sur homeHero) ─────────────────────────────────────────
mkdir -p "$ROUTER_DIR"
cat > "$ROUTER" <<'TS'
import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";

const SETTINGS_ID = "site";

/**
 * Réglages d'identité du site (singleton). Lecture PUBLIQUE (le header, l'onglet
 * et les e-mails les consomment, y compris pour les visiteurs anonymes) ;
 * écriture protégée — même statut que homeHero.save / sitePage.save (pas de
 * permission nommée).
 *
 * `shortTitle` est un LIBELLÉ, sans rapport avec `APP_SHORT_NAME` (racine de
 * stockage, qui reste dans le .env). `logoAssetId` référence un MediaAsset ;
 * chaîne vide traitée comme "pas de logo" (→ logo embarqué en repli).
 */
export const siteSettingsRouter = router({
  get: publicProcedure.query(({ ctx }) =>
    ctx.prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } }),
  ),

  save: protectedProcedure
    .input(
      z.object({
        shortTitle: z.string().trim().min(1).max(60),
        longTitle: z.string().trim().min(1).max(160),
        tagline: z.string().trim().max(200).nullish(),
        supportEmail: z
          .union([z.literal(""), z.string().trim().email().max(160)])
          .nullish(),
        defaultLocale: z.string().trim().min(2).max(10),
        logoAssetId: z.string().trim().max(500).nullish(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const clean = (v: string | null | undefined): string | null =>
        v && v.trim() !== "" ? v.trim() : null;
      const data = {
        shortTitle: input.shortTitle,
        longTitle: input.longTitle,
        tagline: clean(input.tagline),
        supportEmail: clean(input.supportEmail),
        defaultLocale: input.defaultLocale,
        logoAssetId: clean(input.logoAssetId),
      };
      return ctx.prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID, ...data },
        update: data,
      });
    }),
});
TS
echo "écrit  $ROUTER"

# ── 4. Enregistrement dans l'appRouter ──────────────────────────────────────
python3 - "$IDX" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

imp = 'import { siteSettingsRouter } from "@backend/modules/siteSettings/router";\n'
if "siteSettingsRouter" not in s:
    anchor_imp = 'import { homeHeroRouter } from "@backend/modules/homeHero/router";\n'
    assert s.count(anchor_imp) == 1, "ancre import homeHeroRouter introuvable/multiple"
    s = s.replace(anchor_imp, anchor_imp + imp)

reg = "  siteSettings: siteSettingsRouter,\n"
if "siteSettings:" not in s:
    anchor_reg = "  homeHero: homeHeroRouter,\n"
    assert s.count(anchor_reg) == 1, "ancre registration homeHero introuvable/multiple"
    s = s.replace(anchor_reg, anchor_reg + reg)

p.write_text(s, encoding="utf-8")
print("index.ts patché (siteSettings enregistré)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de generate/typecheck/commit"; exit 0
fi

echo "prisma generate…"
if ! pnpm prisma generate > /tmp/akfc_gen.log 2>&1; then
  echo "generate KO :"; tail -8 /tmp/akfc_gen.log; exit 1
fi

echo "typecheck backend + web…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
if ! pnpm --filter web typecheck >> /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(settings): modèle SiteSettings + router get/save (identité de site éditable par l'admin)" \
  && echo "commit $(git rev-parse --short HEAD)"

echo
echo "⚠️  Ensuite : pnpm prisma migrate deploy (local PUIS serveur)."