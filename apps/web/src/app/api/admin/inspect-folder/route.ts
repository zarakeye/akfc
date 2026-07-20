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
