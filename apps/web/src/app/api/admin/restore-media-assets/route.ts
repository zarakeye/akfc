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
