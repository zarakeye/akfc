/**
 * 🛠 Route admin one-shot — backfill MediaAsset depuis R2
 *
 * Équivalent de `/api/admin/backfill-media-assets` (Cloudinary) pour R2.
 * Voir doc complète dans
 * `packages/backend/src/modules/media/services/backfillR2Assets.service.ts`.
 *
 * Workflow attendu :
 *   1. Appliquer la migration `add_full_path_to_media_asset` (backfill
 *      Cloudinary inline)
 *   2. Hit ce endpoint → tous les fichiers R2 historiques sont trackés
 *   3. Appliquer la migration `tighten_full_path` (verrouille fullPath
 *      NOT NULL + UNIQUE)
 *
 * Idempotent : peut être rejouée sans créer de doublons.
 */

import { NextResponse } from 'next/server';
import { APP_ROOT } from '@config/app';
import { backfillR2Assets } from '@backend/modules/media/services/backfillR2Assets.service';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Route disabled in production' },
      { status: 403 },
    );
  }

  try {
    const report = await backfillR2Assets(APP_ROOT);
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
