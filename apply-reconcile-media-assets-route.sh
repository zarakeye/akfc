#!/usr/bin/env bash
#
# AKFC — Réconciliation MediaAsset ↔ binaires (route admin).
#
# PROBLÈME : certains binaires existent dans Cloudinary sans ligne `MediaAsset`
# correspondante (ex. le logo : déplaçable physiquement mais introuvable par le
# picker `resolveByPaths` et non résoluble en move logique). Ce sont des
# "orphelins" côté base.
#
# OUTIL : une route admin qui énumère les binaires (`listAuthenticatedResources`,
# celle qu'utilise déjà le finder) sous APP_ROOT, et reconstruit les lignes
# manquantes via `restoreMediaAssetsByPath` (métadonnées Cloudinary natives ;
# restaure AUSSI les fichiers hors `cours/<catégorie>` — contrairement au
# backfill, qui les skippe — donc couvre le logo). Idempotent : skippe tout
# `fullPath` déjà présent.
#
# SÉCURITÉ : réservée aux ADMIN (session), et — contrairement aux routes backfill
# historiques — ACTIVE en prod (c'est là qu'on en a besoin). DRY-RUN par défaut :
#   GET /api/admin/reconcile-media-assets          → aperçu (ne modifie rien)
#   GET /api/admin/reconcile-media-assets?apply=1  → applique la réconciliation
#
# NB : `listAuthenticatedResources` est capée à 500 résultats par type (image/
# video/raw) sans pagination. Suffisant pour un club ; au-delà, il faudrait
# paginer (dis-le si le report montre un `scanned` proche de 1500).
#
# 1 fichier neuf (route), aucun ancrage. Typecheck web.
#
# Usage : bash apply-reconcile-media-assets-route.sh
#         AKFC_APPLY_ONLY=1 bash apply-reconcile-media-assets-route.sh   (clone)
#
set -euo pipefail

ROUTE_DIR="apps/web/src/app/api/admin/reconcile-media-assets"
ROUTE="$ROUTE_DIR/route.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

mkdir -p "$ROUTE_DIR"
cat > "$ROUTE" <<'TS'
/**
 * 🛠 Route admin — réconciliation MediaAsset ↔ binaires Cloudinary.
 *
 * Énumère les binaires sous APP_ROOT et reconstruit les lignes `MediaAsset`
 * manquantes (orphelins) via `restoreMediaAssetsByPath` — métadonnées Cloudinary
 * natives, catégorie/discipline nulles si hors `cours/<cat>/<disc>` (sans
 * conséquence d'affichage). Idempotent.
 *
 * Réservée ADMIN, active en prod. Dry-run par défaut ; `?apply=1` pour écrire.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createTRPCContext } from "@backend/trpc";
import { APP_ROOT } from "@config/app";
import { listAuthenticatedResources } from "@backend/modules/cloudinary/services/cloudinary.service";
import { restoreMediaAssetsByPath } from "@backend/modules/storage/services/restoreMediaAssetsByPath.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const ctx = await createTRPCContext({ req });

  const userId = ctx.sessionClient?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const me = await ctx.prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  if (me?.role?.name !== "ADMIN") {
    return NextResponse.json(
      { error: "Réservé aux administrateurs." },
      { status: 403 },
    );
  }

  const apply = req.nextUrl.searchParams.get("apply") === "1";

  try {
    const resources = await listAuthenticatedResources(APP_ROOT);
    const fullPaths = resources.map((r) =>
      r.format ? `${r.publicId}.${r.format}` : r.publicId,
    );
    const report = await restoreMediaAssetsByPath(
      ctx.prisma,
      APP_ROOT,
      fullPaths,
      { dryRun: !apply },
    );
    return NextResponse.json({
      ok: true,
      apply,
      scanned: resources.length,
      report,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
TS
echo "écrit  $ROUTE"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(admin): route de réconciliation MediaAsset (ré-enregistre les binaires orphelins), admin, dry-run par défaut" \
  && echo "commit $(git rev-parse --short HEAD)"