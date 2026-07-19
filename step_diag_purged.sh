#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# DIAGNOSTIC (LECTURE SEULE) : combien des 27 lignes purgées étaient de FAUX
# orphelins (binaire présent, ma détection a mal posé la question) ?
#
# ─── L'erreur qu'on mesure ───────────────────────────────────────────────────
#
# findOrphanAssets appelait getMetadata(fullPath). Pour Cloudinary, getAssetInfo
# attend un public_id SANS extension ; on lui passait le fullPath AVEC (.png,
# .jpg). Cloudinary répondait « not found » → faux orphelin.
#
# Ce diagnostic teste chaque chemin CORRECTEMENT, en direct sur les deux
# providers (la ligne DB n'existe plus, donc resolveProvider ne peut pas aider) :
#   - Cloudinary : getAssetInfo(fullPath SANS extension)
#   - R2        : HeadObject(fullPath EXACT)
# et classe : existe (chez qui) vs absent partout.
#
# NE RECONSTRUIT RIEN. Ne fait qu'interroger et compter.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTE="apps/web/src/app/api/admin/diagnose-purged/route.ts"

test -f apps/web/src/app/api/admin/backfill-r2-assets/route.ts \
  || { echo "✗ lance depuis la racine du repo."; exit 1; }
grep -q "export async function getAssetInfo" packages/backend/src/modules/cloudinary/services/cloudinary.service.ts \
  || { echo "✗ getAssetInfo introuvable — état inattendu."; exit 1; }

if [ -f "$ROUTE" ]; then
  echo "→ route diagnose-purged déjà présente, rien à faire."
  exit 0
fi

mkdir -p "$(dirname "$ROUTE")"
cat > "$ROUTE" <<'TSEOF'
/**
 * 🔍 Diagnostic LECTURE SEULE — les lignes purgées étaient-elles de vrais
 * orphelins ?
 *
 * POST un JSON `{ "paths": ["AKFC/published/cours/…/x.png", …] }` (les
 * `fullPath` des lignes supprimées, tels quels avec extension).
 *
 * Pour chacun, teste l'existence du BINAIRE en direct sur les deux providers,
 * avec la clé correcte pour chacun :
 *   - Cloudinary : public_id = fullPath SANS extension
 *   - R2        : clé = fullPath EXACT
 *
 * Classe : `exists` (avec le provider trouvé) vs `missing`.
 * Ne recrée aucune ligne, ne déplace aucun binaire.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { HeadObjectCommand } from '@aws-sdk/client-s3';

import { getAssetInfo } from '@backend/modules/cloudinary/services/cloudinary.service';
import { getR2Client, getR2Bucket } from '@backend/modules/storage/adapters/r2/client';

function toPublicId(fullPath: string): string {
  // Retrait d'extension SEUL — pas de re-slugification : le public_id stocké
  // est le fullPath moins son extension.
  return fullPath.replace(/\.[^/.]+$/, '');
}

async function existsOnCloudinary(fullPath: string): Promise<boolean> {
  try {
    await getAssetInfo(toPublicId(fullPath));
    return true;
  } catch {
    return false;
  }
}

async function existsOnR2(fullPath: string): Promise<boolean> {
  try {
    const s3 = getR2Client();
    const Bucket = getR2Bucket();
    await s3.send(new HeadObjectCommand({ Bucket, Key: fullPath }));
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Route disabled in production' },
      { status: 403 },
    );
  }

  let paths: string[];
  try {
    const body = await request.json();
    paths = Array.isArray(body?.paths) ? body.paths : [];
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Body attendu : { "paths": [...] }' },
      { status: 400 },
    );
  }

  if (paths.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Aucun path fourni.' },
      { status: 400 },
    );
  }

  const exists: Array<{ path: string; provider: 'cloudinary' | 'r2' }> = [];
  const missing: string[] = [];

  for (const path of paths) {
    if (await existsOnCloudinary(path)) {
      exists.push({ path, provider: 'cloudinary' });
    } else if (await existsOnR2(path)) {
      exists.push({ path, provider: 'r2' });
    } else {
      missing.push(path);
    }
  }

  return NextResponse.json({
    ok: true,
    report: {
      scanned: paths.length,
      existsCount: exists.length,
      missingCount: missing.length,
      exists,
      missing,
    },
  });
}
TSEOF
echo "✓ $ROUTE créée"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "feat(admin): route diagnostic lecture seule des lignes purgees (faux orphelins)"
echo "✓ commité."