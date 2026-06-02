import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@backend/prisma';
import { getR2Bucket, getR2Client } from '@backend/modules/storage/adapters/r2/client';

/**
 * Route publique pour les fichiers R2 référencés depuis le page-builder.
 *
 * ─── Différence avec `/api/media/r2/[...path]` ──────────────────────────
 *
 * La route admin signe et redirige pour n'importe quel asset R2, à
 * condition que l'appelant ait une session admin. Cette route-ci est
 * accessible **sans auth**, mais avec une garde stricte :
 *
 *   l'asset doit être en `published` ET référencé par au moins une
 *   `PageMediaReference` (sous-chantier 2).
 *
 * Autrement dit : l'admin a fait **deux gestes intentionnels** pour
 * que cet asset soit publiquement servi — il l'a marqué publishable
 * dans la bibliothèque, et il l'a inséré dans le contenu d'une page
 * (le sync du sous-chantier 4 a alors créé la référence). Sans ces
 * deux gestes, l'asset reste invisible.
 *
 * Pas de filtrage sur le statut de la page elle-même (Course / Stage
 * n'ont pas de flag de publication ; Post en a un mais ce serait
 * inconsistant). Si tu veux serrer plus tard, c'est ici que ça se
 * passe — mais la sémantique actuelle est défendable et simple.
 *
 * ─── La requête en une passe ────────────────────────────────────────────
 *
 * On part de `PageMediaReference` et on rejoint sur `MediaAsset` via la
 * relation directe — pas besoin d'une relation inverse côté MediaAsset
 * (qui n'est pas déclarée dans le schéma actuel). Une seule requête
 * vérifie tout :
 *
 *     PageMediaReference WHERE mediaAsset.fullPath = ? AND mediaAsset.status = 'published'
 *
 * S'il en existe au moins une, l'asset passe. Sinon 404.
 *
 * ─── Pourquoi 404 et pas 403 ────────────────────────────────────────────
 *
 * On ne révèle pas que le path existe mais qu'on refuse de le servir —
 * un visiteur ne devrait pas pouvoir distinguer « cet asset n'existe
 * pas » de « cet asset existe mais n'est pas publiable ». On rend 404
 * uniformément.
 *
 * ─── Reprise du pattern presigned redirect ─────────────────────────────
 *
 * Comme la route admin : on signe une GET URL R2 (30 min), on redirige
 * le navigateur en 302, et c'est Cloudflare qui sert les octets — zero
 * egress côté backend AKFC.
 */

const PRESIGNED_URL_EXPIRY_SECONDS = 30 * 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  // ─── Path ─────────────────────────────────────────────────────────────
  const { path } = await params;
  if (!path || path.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const r2Key = path.join('/');

  // Mêmes validations basiques que la route admin (anti-traversée).
  // Le hardcode `AKFC/` matche l'appRoot du projet — si tu changes
  // d'appRoot un jour, à synchroniser ici et dans la route admin.
  if (!r2Key.startsWith('AKFC/') || r2Key.includes('..')) {
    return new NextResponse('Not found', { status: 404 });
  }

  // ─── Garde : asset published + référencé par au moins une page ────────
  const reference = await prisma.pageMediaReference.findFirst({
    where: {
      mediaAsset: {
        fullPath: r2Key,
        status: 'published',
      },
    },
    select: { id: true },
  });

  if (!reference) {
    return new NextResponse('Not found', { status: 404 });
  }

  // ─── Sign + redirect ──────────────────────────────────────────────────
  try {
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: r2Key,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });

    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        // L'URL signée change à chaque requête (nouvelle signature, nouvelle
        // expiration), donc on n'autorise aucun cache de la redirection
        // elle-même. La réponse de Cloudflare R2 peut être cachée selon
        // ses propres headers.
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (err) {
    console.error(
      '[api/media/public/r2] Failed to sign URL for',
      r2Key,
      err,
    );
    return new NextResponse('Internal server error', { status: 500 });
  }
}
