import type { Prisma, PrismaClient } from '@prisma/client';

import type { ResolvedMedia } from '@contracts/page';
import { buildMediaProxyUrl } from '@backend/modules/media/helpers/media-url';

/* ─────────────────────────────────────────────────────────────────────── */
/*  Audience                                                               */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Pour qui les URLs sont-elles construites ?
 *
 *   - `admin`  : les routes de proxy admin-gated
 *                (`/api/media/r2/<path>` pour R2). C'est ce qui est
 *                consommé par le builder en édition, les NodeViews,
 *                le MediaListEditor, et les previews dans l'admin.
 *
 *   - `public` : les routes publiques. Identiques côté Cloudinary
 *                (la route `by-public-id` est déjà publique), mais
 *                différentes côté R2 où on passe par
 *                `/api/media/public/r2/<path>` qui vérifie qu'un
 *                `PageMediaReference` existe avant de signer.
 *
 * Default `'admin'` pour ne pas casser les call sites existants
 * (procédure tRPC `media.resolveByIds`).
 */
export type MediaUrlAudience = 'admin' | 'public';

/* ─────────────────────────────────────────────────────────────────────── */
/*  resolveMediaByIds                                                      */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Résout une liste de `mediaId` (cuid stable) vers leurs informations
 * de rendu (URL + métadonnées), pour l'audience donnée.
 *
 * ─── Service neutre, sans auth ─────────────────────────────────────────
 *
 * Appelable :
 *   - depuis la procédure tRPC `media.resolveByIds` (admin) — passer
 *     `audience: 'admin'` (ou laisser le default)
 *   - depuis le RSC `PageRenderer` (public) — passer `audience: 'public'`
 *
 * Le filtre `status === 'published'` reste appliqué dans tous les cas :
 * c'est lui qui matérialise la règle « ce qui est rendu depuis la
 * bibliothèque ne peut être pris que sous published ».
 *
 * ─── Retour ────────────────────────────────────────────────────────────
 *
 * `Record<mediaId, ResolvedMedia | null>` indexé par tous les mediaIds
 * d'entrée — les ids absents de la DB ou non-published rendent `null`.
 */
export async function resolveMediaByIds(
  db: PrismaClient | Prisma.TransactionClient,
  mediaIds: readonly string[],
  audience: MediaUrlAudience = 'admin',
): Promise<Record<string, ResolvedMedia | null>> {
  const byId: Record<string, ResolvedMedia | null> = {};
  for (const id of mediaIds) byId[id] = null;
  if (mediaIds.length === 0) return byId;

  const assets = await db.mediaAsset.findMany({
    where: {
      id: { in: [...mediaIds] },
      status: 'published',
    },
    select: {
      id: true,
      publicId: true,
      fullPath: true,
      mimeType: true,
      width: true,
      height: true,
      duration: true,
      resourceType: true,
    },
  });

  for (const asset of assets) {
    const isVideo =
      asset.resourceType === 'video' || asset.mimeType.startsWith('video/');
    const isAudio = !isVideo && asset.mimeType.startsWith('audio/');
    const isImage = !isVideo && !isAudio && asset.mimeType.startsWith('image/');

    const baseUrl = buildMediaProxyUrl(asset);
    byId[asset.id] = {
      url: buildMediaProxyUrl(asset, audience),
      kind: isVideo ? 'video' : isAudio ? 'audio' : isImage ? 'image' : 'document',
      posterUrl: isVideo ? `${baseUrl}&as=poster` : null,
      mimeType: asset.mimeType,
      fileName: lastSegment(asset.fullPath),
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
    };
  }

  return byId;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Extrait le dernier segment d'un path (le « nom de fichier »).
 *
 * Sert de label de repli côté View quand l'éditeur n'a pas saisi de
 * title/label/caption. Tolérant aux trailing slashes.
 */
function lastSegment(fullPath: string): string {
  const trimmed = fullPath.replace(/\/+$/, '');
  const idx = trimmed.lastIndexOf('/');
  return idx === -1 ? trimmed : trimmed.slice(idx + 1);
}
