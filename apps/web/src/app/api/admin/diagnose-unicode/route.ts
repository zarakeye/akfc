/**
 * 🔬 Diagnostic Unicode LECTURE SEULE. POST { "path": "AKFC/…/Stéphane.jpg" }.
 * Interroge Cloudinary avec la forme NFC ET la forme NFD du public_id (sans
 * extension), et dit laquelle existe. Ne modifie rien.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';

async function probe(publicId: string): Promise<boolean> {
  for (const rt of ['image', 'video', 'raw'] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: 'authenticated',
        resource_type: rt,
      });
      if (res?.public_id) return true;
    } catch {
      // next
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled in prod' }, { status: 403 });
  }
  let path: string;
  try {
    const body = await request.json();
    path = String(body?.path ?? '');
  } catch {
    return NextResponse.json({ ok: false, error: 'body { path }' }, { status: 400 });
  }
  if (!path) return NextResponse.json({ ok: false, error: 'path vide' }, { status: 400 });

  const stripExt = (s: string) => s.replace(/\.[^/.]+$/, '');
  const nfc = stripExt(path.normalize('NFC'));
  const nfd = stripExt(path.normalize('NFD'));

  const [existsNFC, existsNFD] = await Promise.all([probe(nfc), probe(nfd)]);

  return NextResponse.json({
    ok: true,
    report: {
      inputWasNFC: path === path.normalize('NFC'),
      existsAsNFC: existsNFC,
      existsAsNFD: existsNFD,
      verdict: existsNFC
        ? 'stocké en NFC'
        : existsNFD
          ? 'stocké en NFD — le code doit normaliser en NFD avant requête'
          : 'introuvable sous les deux formes',
    },
  });
}
