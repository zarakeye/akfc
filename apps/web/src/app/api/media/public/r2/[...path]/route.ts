import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@backend/prisma';
import { APP_ROOT } from '@config/app';
import { getR2Bucket, getR2Client } from '@backend/modules/storage/adapters/r2/client';
import { resolveDeliveryKey, streamDerived } from '@backend/modules/media/services/mediaDerivatives.service';
import { isPubliclyPlaced } from '@backend/modules/media/services/publiclyPlaced.service';
import { outsideBin } from '@backend/modules/storage/mediaPaths';

/**
 * Route publique pour les fichiers R2 référencés depuis le page-builder.
 *
 * ─── Différence avec `/api/media/r2/[...path]` ──────────────────────────
 *
 * La route privée signe et redirige pour un fichier que l'appelant a le
 * droit de lire (session + canReadStorageKey). Cette route-ci est
 * accessible **sans auth**, mais avec une garde stricte :
 *
 *   l'asset doit être en `published`, hors corbeille, ET placé dans du
 *   PUBLIC : une galerie publique, ou un contenu PUBLIÉ (`isPubliclyPlaced` :
 *   date de publication passée, discipline publiée pour un cours,
 *   interrupteur activé pour une page éditoriale).
 *
 * Autrement dit : l'admin a fait **trois gestes intentionnels** pour que cet
 * asset soit publiquement servi — il l'a validé dans la bibliothèque, il l'a
 * inséré dans un contenu (le recensement a créé la référence), et il a publié
 * ce contenu. Un brouillon recense ses fichiers dès son premier
 * enregistrement : sans la troisième condition, ses fichiers étaient servis à
 * qui connaissait leur URL, alors que la page, elle, répondait 404.
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
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  // ─── Path ─────────────────────────────────────────────────────────────
  const { path } = await params;
  if (!path || path.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const r2Key = path.join('/');

  // Mêmes validations que la route privée : racine de l'application, pas de remontée.
  if (!r2Key.startsWith(`${APP_ROOT}/`) || r2Key.includes('..')) {
    return new NextResponse('Not found', { status: 404 });
  }

  // ─── Garde : asset validé, hors corbeille, et placé dans du PUBLIC ──────
  // (une galerie publique, ou un contenu PUBLIÉ : les fichiers d'un brouillon ne sont visibles
  // que des administrateurs, par la route privée).
  const asset = await prisma.mediaAsset.findFirst({
    where: { fullPath: r2Key, status: 'published', ...outsideBin(APP_ROOT) },
    select: { id: true },
  });

  if (!asset || !(await isPubliclyPlaced(prisma, asset.id))) {
    return new NextResponse('Not found', { status: 404 });
  }

  // ─── Sign + redirect ──────────────────────────────────────────────────
  try {
    // Déclinaison demandée (?variant=…, &as=poster) : fabriquée au besoin, sinon l'original.
    const key = await resolveDeliveryKey(r2Key, req.nextUrl.searchParams);
    if (!key) return new NextResponse('Not found', { status: 404 });
    // Déclinaison : en flux, cachable (une heure, puis revalidée en arrière-plan).
    if (key !== r2Key) return (await streamDerived(key, 'public, max-age=3600, stale-while-revalidate=86400', req.headers.get('accept'))) as NextResponse;
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
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
