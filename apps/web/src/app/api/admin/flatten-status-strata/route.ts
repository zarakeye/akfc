/**
 * 🛠 Route admin one-shot — aplatissement des strates de statut (étape 5).
 *
 * Déplace RÉELLEMENT les binaires historiques `AKFC/<statut>/…` → `AKFC/…`.
 * Voir la doc complète dans
 * `packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts`.
 *
 *   GET (défaut)      → DRY-RUN : liste les moves, ne déplace rien.
 *   GET ?run=1        → exécute. Idempotent & reprenable.
 *
 * Désactivée en production (comme backfill-r2-assets) : pointer un dev local
 * sur la DB cible pour l'exécuter.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { APP_ROOT } from '@config/app';
import { prisma } from '@backend/prisma';
import { flattenStatusStrata } from '@backend/modules/storage/services/flattenStatusStrata.service';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Route disabled in production' },
      { status: 403 },
    );
  }

  const run = request.nextUrl.searchParams.get('run') === '1';

  try {
    const report = await flattenStatusStrata(prisma, APP_ROOT, {
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
