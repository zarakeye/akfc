#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# RÉPARATION : reconstruit les 28 lignes MediaAsset supprimées à tort.
#
# Le service restoreMediaAssetsByPath.service.ts a été déposé par Claude. Ce
# script pose la route admin qui l'expose, et corrige AU PASSAGE le bug de
# détection dans findOrphanAssets (extension non retirée pour Cloudinary), pour
# qu'il ne refasse jamais de faux orphelins.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SERVICE="packages/backend/src/modules/storage/services/restoreMediaAssetsByPath.service.ts"
FLATTEN="packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts"
ROUTE="apps/web/src/app/api/admin/restore-media-assets/route.ts"

test -f "$SERVICE" || { echo "✗ $SERVICE absent — le service de restauration n'a pas été déposé."; exit 1; }
test -f "$FLATTEN" || { echo "✗ $FLATTEN absent — lance depuis la racine."; exit 1; }

# ── 1) Corriger le bug de détection dans findOrphanAssets ────────────────────
# getMetadata(fullPath) échoue sur Cloudinary (extension). On teste désormais
# avec le public_id (sans extension) pour Cloudinary, fullPath pour R2.
if grep -q "toPublicIdForOrphanCheck" "$FLATTEN"; then
  echo "→ findOrphanAssets déjà corrigé."
else
  python3 - <<'PYEOF'
import pathlib
p = pathlib.Path("packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts")
src = p.read_text(encoding="utf-8")

OLD = """  const storage = new VirtualStorage({ prisma, appRoot });
  const orphans: OrphanReport['orphans'] = [];

  for (const asset of assets) {
    const meta = await storage.getMetadata(asset.fullPath);
    if (meta === null) {
      orphans.push({
        id: asset.id,
        fullPath: asset.fullPath,
        provider: asset.publicId ? 'cloudinary' : 'r2',
      });
    }
  }"""

NEW = """  const storage = new VirtualStorage({ prisma, appRoot });
  const orphans: OrphanReport['orphans'] = [];

  // ⚠️ Cloudinary indexe par public_id (SANS extension). Interroger avec le
  // fullPath (AVEC extension) renvoie toujours « not found » → faux orphelins.
  // On teste donc au bon identifiant selon le provider.
  const toPublicIdForOrphanCheck = (fullPath: string): string =>
    fullPath.replace(/\\.[^/.]+$/, '');

  for (const asset of assets) {
    const isCloudinary = asset.publicId != null;
    const probePath = isCloudinary
      ? toPublicIdForOrphanCheck(asset.fullPath)
      : asset.fullPath;
    const meta = await storage.getMetadata(probePath);
    if (meta === null) {
      orphans.push({
        id: asset.id,
        fullPath: asset.fullPath,
        provider: isCloudinary ? 'cloudinary' : 'r2',
      });
    }
  }"""

assert src.count(OLD) == 1, f"ancre findOrphanAssets trouvee {src.count(OLD)} fois"
p.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("  ✓ findOrphanAssets corrigé (extension retirée pour Cloudinary)")
PYEOF
fi

# ── 2) La route de restauration ─────────────────────────────────────────────
if [ -f "$ROUTE" ]; then
  echo "→ route restore-media-assets déjà présente."
else
  mkdir -p "$(dirname "$ROUTE")"
  cat > "$ROUTE" <<'TSEOF'
/**
 * 🔧 Route admin — reconstruit des lignes MediaAsset supprimées à tort.
 *
 * POST { "paths": ["AKFC/…/x.png", …], "run": false }
 *   run=false (défaut) → DRY-RUN : liste ce qui serait restauré / déjà présent.
 *   run=true           → crée réellement les lignes (idempotent sur fullPath).
 *
 * Désactivée en production.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { APP_ROOT } from '@config/app';
import { prisma } from '@backend/prisma';
import { restoreMediaAssetsByPath } from '@backend/modules/storage/services/restoreMediaAssetsByPath.service';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Route disabled in production' },
      { status: 403 },
    );
  }

  let paths: string[];
  let run = false;
  try {
    const body = await request.json();
    paths = Array.isArray(body?.paths) ? body.paths : [];
    run = body?.run === true;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Body attendu : { "paths": [...], "run": bool }' },
      { status: 400 },
    );
  }

  if (paths.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Aucun path fourni.' },
      { status: 400 },
    );
  }

  try {
    const report = await restoreMediaAssetsByPath(prisma, APP_ROOT, paths, {
      dryRun: !run,
    });
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
TSEOF
  echo "✓ $ROUTE créée"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "fix(storage): restauration des lignes purgees a tort + correction detection orphelins"
echo "✓ commité."