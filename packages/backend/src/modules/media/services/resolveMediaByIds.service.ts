import type { Prisma, PrismaClient } from '@prisma/client';

import type { ResolvedMedia } from '@contracts/page';

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
/*  buildMediaProxyUrl                                                     */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Construit l'URL relative qui sert un asset au navigateur, selon
 * l'audience visée.
 *
 *   - Cloudinary (`publicId` non-null) : `/api/media/by-public-id/...`
 *     dans les deux cas (la route est publique de base).
 *   - R2 (`publicId` null) : `/api/media/r2/...` pour l'admin,
 *     `/api/media/public/r2/...` pour le visiteur public.
 *
 * Encodage segment par segment pour gérer dossiers/fichiers avec
 * caractères spéciaux sans casser les `/` structurels.
 */
export function buildMediaProxyUrl(
  asset: { publicId: string | null; fullPath: string },
  audience: MediaUrlAudience = 'admin',
): string {
  const encodeSegments = (path: string) =>
    path.split('/').map(encodeURIComponent).join('/');

  if (asset.publicId !== null) {
    return `/api/media/by-public-id/${encodeSegments(asset.publicId)}?variant=large`;
  }

  const r2Prefix =
    audience === 'public' ? '/api/media/public/r2' : '/api/media/r2';
  return `${r2Prefix}/${encodeSegments(asset.fullPath)}`;
}

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
    },
  });

  for (const asset of assets) {
    byId[asset.id] = {
      url: buildMediaProxyUrl(asset, audience),
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
