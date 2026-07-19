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
