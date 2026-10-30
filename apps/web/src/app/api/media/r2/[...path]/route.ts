import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getR2Client, getR2Bucket } from '@backend/modules/storage/adapters/r2/client';
import { resolveDeliveryKey, streamDerived } from '@backend/modules/media/services/mediaDerivatives.service';
import { getSessionFromRequest } from '@backend/modules/auth/getSessionFromRequest';
import { canReadStorageKey } from '@backend/modules/media/services/canReadStorageKey.service';
import { prisma } from '@backend/prisma';
import { APP_ROOT } from '@config/app';

/**
 * Proxy de preview pour les fichiers hébergés sur R2.
 *
 * Pattern : le navigateur appelle `/api/media/r2/<path>`, on vérifie la
 * session et le droit de lecture, on génère une **presigned GET URL** R2 valide 30 minutes,
 * puis on **redirige (302)** le navigateur vers cette URL. Le navigateur
 * va alors récupérer le contenu direct depuis R2 (zero egress côté
 * Cloudflare) — le backend n'est plus dans la boucle pour les octets.
 *
 * ─── Pourquoi un redirect plutôt qu'un streaming via le backend ? ────────
 *
 * Streamer le contenu via le backend Node imposerait que toute la bande
 * passante R2 → user passe par le serveur AKFC (donc charge réseau et
 * mémoire côté Hetzner). Le redirect 302 délègue ça au CDN Cloudflare,
 * qui est *fait* pour ça.
 *
 * Trade-off : l'URL signée est exposée au navigateur. Elle expire en
 * 30 min, est scopée à un seul fichier (GET only), et n'est fabriquée
 * qu'après la vérification du droit de lecture. Acceptable.
 *
 * ─── Path encoding ────────────────────────────────────────────────────────
 *
 * Le `[...path]` de Next.js récupère un tableau de segments URL-decodés.
 * Pour reconstruire la R2 key, on rejoint avec `/` — pas besoin de
 * re-decoder. Si le client a bien encoded segment-par-segment côté UI
 * (split sur '/' puis encodeURIComponent par segment), tout matche.
 *
 * ─── Sécurité ─────────────────────────────────────────────────────────────
 *
 *   - Session requise (sinon 401)
 *   - Droit de lecture vérifié par `canReadStorageKey` : un admin lit tout, un membre lit
 *     l'espace de ses groupes collaboratifs et son espace personnel. Sinon 404 : l'existence
 *     d'un fichier n'est pas révélée.
 *   - Path validé : doit commencer par l'appRoot pour empêcher l'accès
 *     à des paths hors application
 *   - Pas de fallback "public" : tout le R2 d'AKFC est privé par défaut
 *
 * En cas de partage public (ex: lien envoyé par email), il faudra plus
 * tard une route séparée `/api/share/r2/[token]/...` avec ses propres
 * règles de validation.
 */

const PRESIGNED_URL_EXPIRY_SECONDS = 30 * 60; // 30 minutes

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  // ─── Auth ────────────────────────────────────────────────────────────
  const session = await getSessionFromRequest(req);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // ─── Path ────────────────────────────────────────────────────────────
  const { path } = await params;
  if (!path || path.length === 0) {
    return new NextResponse('Path required', { status: 400 });
  }

  const r2Key = path.join('/');

  // Racine de l'application obligatoire : les déclinaisons (`_derived/…`) et tout ce qui vivrait
  // hors de la racine ne sont jamais servis par leur clé.
  if (!r2Key.startsWith(`${APP_ROOT}/`)) {
    return new NextResponse('Forbidden: path out of app root', { status: 403 });
  }
  if (r2Key.includes('..')) {
    return new NextResponse('Forbidden: invalid path', { status: 403 });
  }
  const userId = session.user?.id;
  if (!userId || !(await canReadStorageKey({ prisma, userId, key: r2Key }))) {
    return new NextResponse('Not found', { status: 404 });
  }

  // ─── Sign GET URL ────────────────────────────────────────────────────
  try {
    // Déclinaison demandée (?variant=…, &as=poster) : fabriquée au besoin, sinon l'original.
    const key = await resolveDeliveryKey(r2Key, req.nextUrl.searchParams);
    if (!key) return new NextResponse('Not found', { status: 404 });
    // Déclinaison : en flux, cachable par le navigateur (session requise : cache privé).
    if (key !== r2Key) return (await streamDerived(key, 'private, max-age=3600', req.headers.get('accept'))) as NextResponse;
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      // Note : pas de ResponseContentDisposition forcé → le navigateur
      // décide selon le Content-Type (inline pour pdf/image/video, etc.).
      // Si on veut forcer un download : ResponseContentDisposition: `attachment; filename="..."`.
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });

    // ─── Redirect ──────────────────────────────────────────────────────
    // 302 (temporary redirect) + Cache-Control headers prudents :
    //   - Pas de cache navigateur sur l'URL du proxy (la signature change à chaque appel)
    //   - Le navigateur cachera la réponse R2 elle-même selon ses propres headers
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (err) {
    console.error('[api/media/r2] Failed to sign URL for', r2Key, err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
