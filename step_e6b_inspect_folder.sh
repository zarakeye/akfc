#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# VAGUE B — inventaire récursif + destruction ciblée d'un dossier obsolète.
#
# `AKFC/pending/medias` a survécu à la suppression de masse (assetCount=0 au
# 1er niveau, mais le dossier résiste → contenu en profondeur non compté).
# Cette route l'inventorie RÉCURSIVEMENT (tous resource_types, pagination
# complète) et ne détruit que sur ?run=1.
#
# Ciblage EXPLICITE sur un chemin passé en paramètre, jamais un préfixe large.
# Règle qu'on s'est fixée : on VOIT le contenu avant de détruire.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTE="apps/web/src/app/api/admin/inspect-folder/route.ts"
test -f apps/web/src/app/api/admin/backfill-r2-assets/route.ts \
  || { echo "✗ lance depuis la racine."; exit 1; }

if [ -f "$ROUTE" ]; then echo "→ route déjà présente."; exit 0; fi

mkdir -p "$(dirname "$ROUTE")"
cat > "$ROUTE" <<'TSEOF'
/**
 * 🔬 Inspecte (et optionnellement détruit) un dossier Cloudinary précis.
 *
 *   POST { "path": "AKFC/pending/medias", "run": false }
 *     run=false (défaut) → liste RÉCURSIVEMENT tous les assets sous le chemin.
 *     run=true           → deleteByPrefix(path) après inventaire.
 *
 * Pagination complète (next_cursor) et les 3 resource_types, pour ne rien
 * rater — contrairement au comptage plafonné qui avait affiché 0 à tort.
 * Désactivée en production.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';
import { deleteByPrefix } from '@backend/modules/cloudinary/services/cloudinary.service';

async function listAllUnder(prefix: string): Promise<
  Array<{ public_id: string; resource_type: string; bytes?: number }>
> {
  const out: Array<{ public_id: string; resource_type: string; bytes?: number }> =
    [];
  for (const resource_type of ['image', 'video', 'raw'] as const) {
    let cursor: string | undefined = undefined;
    do {
      try {
        const res: {
          resources?: Array<{ public_id: string; bytes?: number }>;
          next_cursor?: string;
        } = await cloudinary.api.resources({
          type: 'authenticated',
          resource_type,
          prefix,
          max_results: 500,
          ...(cursor ? { next_cursor: cursor } : {}),
        });
        for (const r of res.resources ?? []) {
          out.push({
            public_id: r.public_id,
            resource_type,
            bytes: r.bytes,
          });
        }
        cursor = res.next_cursor;
      } catch {
        cursor = undefined;
      }
    } while (cursor);
  }
  return out;
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled in prod' }, { status: 403 });
  }

  let path: string;
  let run = false;
  try {
    const body = await request.json();
    path = String(body?.path ?? '');
    run = body?.run === true;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'body { path, run }' },
      { status: 400 },
    );
  }
  if (!path) {
    return NextResponse.json({ ok: false, error: 'path vide' }, { status: 400 });
  }

  const assets = await listAllUnder(path);

  if (!run) {
    return NextResponse.json({
      ok: true,
      report: {
        dryRun: true,
        path,
        assetCount: assets.length,
        assets,
        note: 'Aucune suppression. Relancer avec run:true pour détruire.',
      },
    });
  }

  await deleteByPrefix(path);
  return NextResponse.json({
    ok: true,
    report: { dryRun: false, path, deletedCount: assets.length, assets },
  });
}
TSEOF
echo "✓ $ROUTE créée"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop."; exit 0; fi
echo "→ typecheck backend…"; pnpm --filter backend typecheck || { echo "✗ backend rouge"; exit 1; }
echo "→ typecheck racine…"; pnpm typecheck || { echo "✗ racine rouge"; exit 1; }
git add -A && git commit -m "chore(admin): inspection recursive + destruction ciblee d'un dossier (vague B)"
echo "✓ commité."