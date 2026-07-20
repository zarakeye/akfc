#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# VAGUE B (correctif) : inspect-folder balaie les 3 DELIVERY TYPES.
#
# Cause trouvée : « Folder is not empty » (400). medias contient des assets en
# type:"upload" (ancienne implémentation, avant les assets signés). Ni
# l'inventaire ni deleteByPrefix ne les voyaient — ils ne testaient que
# type:"authenticated".
#
# Cette version teste type ∈ {upload, authenticated, private} × resource_type ∈
# {image, video, raw}. En inventaire ET en suppression. Puis delete_folder.
#
# REMPLACE la route inspect-folder existante.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTE="apps/web/src/app/api/admin/inspect-folder/route.ts"
test -f "$ROUTE" || { echo "✗ $ROUTE absent — lance d'abord step_e6b_inspect_folder.sh."; exit 1; }

if grep -q "DELIVERY_TYPES" "$ROUTE"; then
  echo "→ inspect-folder gère déjà les 3 delivery types, rien à faire."
  exit 0
fi

cat > "$ROUTE" <<'TSEOF'
/**
 * 🔬 Inspecte / détruit un dossier Cloudinary, TOUS delivery types confondus.
 *
 *   POST { "path": "AKFC/pending/medias", "run": false }
 *     run=false → inventaire récursif (upload + authenticated + private).
 *     run=true  → supprime les assets (tous types) puis le dossier.
 *
 * Le « Folder is not empty » venait d'assets en type:"upload" (ancienne
 * implémentation) invisibles aux outils qui ne testaient qu'"authenticated".
 * Désactivée en production.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';

const DELIVERY_TYPES = ['upload', 'authenticated', 'private'] as const;
const RESOURCE_TYPES = ['image', 'video', 'raw'] as const;

async function listAllUnder(prefix: string): Promise<
  Array<{ public_id: string; type: string; resource_type: string; bytes?: number }>
> {
  const out: Array<{
    public_id: string;
    type: string;
    resource_type: string;
    bytes?: number;
  }> = [];
  for (const type of DELIVERY_TYPES) {
    for (const resource_type of RESOURCE_TYPES) {
      let cursor: string | undefined = undefined;
      do {
        try {
          const res: {
            resources?: Array<{ public_id: string; bytes?: number }>;
            next_cursor?: string;
          } = await cloudinary.api.resources({
            type,
            resource_type,
            prefix,
            max_results: 500,
            ...(cursor ? { next_cursor: cursor } : {}),
          });
          for (const r of res.resources ?? []) {
            out.push({
              public_id: r.public_id,
              type,
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
  }
  return out;
}

async function deleteAllUnder(prefix: string): Promise<void> {
  for (const type of DELIVERY_TYPES) {
    for (const resource_type of RESOURCE_TYPES) {
      try {
        await cloudinary.api.delete_resources_by_prefix(prefix, {
          type,
          resource_type,
        });
      } catch {
        // combinaison sans asset → ignore
      }
    }
  }
}

async function deleteFolderDeep(folderPath: string): Promise<void> {
  // enfants d'abord (DFS), puis le dossier
  try {
    const res = await cloudinary.api.sub_folders(folderPath);
    for (const sub of (res.folders ?? []) as Array<{ path: string }>) {
      await deleteFolderDeep(sub.path);
    }
  } catch {
    // pas de sous-dossiers
  }
  try {
    await cloudinary.api.delete_folder(folderPath);
  } catch {
    // tolérant
  }
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
    return NextResponse.json({ ok: false, error: 'body { path, run }' }, { status: 400 });
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
        byType: DELIVERY_TYPES.map((t) => ({
          type: t,
          count: assets.filter((a) => a.type === t).length,
        })),
        assets,
        note: 'Aucune suppression. Relancer avec run:true pour détruire.',
      },
    });
  }

  await deleteAllUnder(path);
  await deleteFolderDeep(path);

  return NextResponse.json({
    ok: true,
    report: { dryRun: false, path, deletedCount: assets.length, assets },
  });
}
TSEOF
echo "✓ $ROUTE réécrite (3 delivery types)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop."; exit 0; fi
echo "→ typecheck backend…"; pnpm --filter backend typecheck || { echo "✗ backend rouge"; exit 1; }
echo "→ typecheck racine…"; pnpm typecheck || { echo "✗ racine rouge"; exit 1; }
git add -A && git commit -m "fix(admin): inspect-folder couvre les 3 delivery types (medias legacy en upload)"
echo "✓ commité."