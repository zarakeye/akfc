import type { Prisma, PageReferencerKind } from '@prisma/client';
import { TRPCError } from '@trpc/server';

import {
  extractMediaIdsFromContent,
  type PageContentV1,
} from '@contracts/page';

/**
 * 🔗 syncPageMediaReferences
 *
 * Synchronise les rows `PageMediaReference` après save (ou avant delete)
 * d'une page composite. Appelée transactionnellement par les mutations
 * qui sauvegardent un composite de page (cf. routers course / stage /
 * post).
 *
 * ─── Mécanique ─────────────────────────────────────────────────────────
 *
 *   1. Lire les références anciennes (= rows actuellement en DB pour la
 *      paire `(pageType, pageId)`)
 *   2. Extraire les références nouvelles depuis le composite via
 *      `extractMediaIdsFromContent` (déduplication incluse)
 *   3. Calculer le diff :
 *        toRemove = old \ new
 *        toAdd    = new \ old
 *   4. Valider que chaque mediaId à ajouter pointe vers un asset
 *      réellement présent en DB ET dont `status === 'published'`
 *   5. Appliquer le diff (DELETE puis INSERT)
 *
 * ─── Cas particulier : delete d'une page ──────────────────────────────
 *
 * Pour libérer toutes les références d'une page avant son delete,
 * passer `newContent: null`. Le helper supprime alors toutes les rows
 * `PageMediaReference` pour la paire `(pageType, pageId)` sans
 * valider quoi que ce soit. À appeler dans la même transaction que
 * le `course.delete` / `stage.delete` / `post.delete`.
 *
 * ─── Pourquoi un `tx` en paramètre et pas `prisma` ────────────────────
 *
 * La sync DOIT s'exécuter dans la même transaction Prisma que la
 * mutation parente. Si une référence à ajouter pointe vers un asset
 * non-published, on jette `TRPCError(BAD_REQUEST)` — le throw propage
 * dans la transaction, le save de la page roll-back, et l'utilisateur
 * reçoit un diagnostic précis. Sans transaction commune, le save
 * pourrait réussir avec un état d'intégrité incohérent.
 */
export async function syncPageMediaReferences(
  tx: Prisma.TransactionClient,
  args: {
    pageType: PageReferencerKind;
    pageId: string;
    newContent: PageContentV1 | null;
    /**
     * Médias référencés par la page SANS passer par un bloc — par exemple
     * l'image de carte d'une discipline, rangée dans une colonne à part.
     *
     * Sans eux, ces médias échapperaient au recensement et passeraient pour
     * orphelins, donc éligibles au nettoyage. Ignorés quand `newContent` est
     * `null` : ce cas signifie « la page disparaît », et tout doit alors
     * partir avec elle.
     */
    extraMediaIds?: readonly string[];
  },
): Promise<{ added: string[]; removed: string[] }> {
  const { pageType, pageId, newContent, extraMediaIds } = args;

  /* ─── 1. Lecture des références anciennes ─────────────────────────── */

  const oldRows = await tx.pageMediaReference.findMany({
    where: { pageType, pageId },
    select: { mediaAssetId: true },
  });
  const oldRefs = new Set(oldRows.map((r) => r.mediaAssetId));

  /* ─── 2. Cas "delete" : on supprime tout et on s'arrête ───────────── */

  if (newContent === null) {
    if (oldRefs.size === 0) {
      return { added: [], removed: [] };
    }
    await tx.pageMediaReference.deleteMany({
      where: { pageType, pageId },
    });
    return { added: [], removed: [...oldRefs] };
  }

  /* ─── 3. Cas "save" : calcul du diff ──────────────────────────────── */

  const newRefs = new Set([
    ...extractMediaIdsFromContent(newContent),
    ...(extraMediaIds ?? []),
  ]);

  const toRemove = [...oldRefs].filter((id) => !newRefs.has(id));
  const toAdd = [...newRefs].filter((id) => !oldRefs.has(id));

  /* ─── 4. Validation des nouvelles refs ────────────────────────────── */

  if (toAdd.length > 0) {
    const validAssets = await tx.mediaAsset.findMany({
      where: { id: { in: toAdd }, status: 'published' },
      select: { id: true },
    });
    const validIds = new Set(validAssets.map((a) => a.id));
    const invalid = toAdd.filter((id) => !validIds.has(id));

    if (invalid.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          `Le composite référence ${invalid.length} mediaId(s) qui n'existent pas ` +
          `ou qui ne sont pas en 'published'. Ids fautifs : ${invalid.join(', ')}.`,
        cause: { invalidMediaIds: invalid },
      });
    }
  }

  /* ─── 5. Application du diff ──────────────────────────────────────── */

  if (toRemove.length > 0) {
    await tx.pageMediaReference.deleteMany({
      where: { pageType, pageId, mediaAssetId: { in: toRemove } },
    });
  }

  if (toAdd.length > 0) {
    await tx.pageMediaReference.createMany({
      data: toAdd.map((mediaAssetId) => ({
        mediaAssetId,
        pageType,
        pageId,
      })),
    });
  }

  return { added: toAdd, removed: toRemove };
}
