import type { Prisma, PrismaClient } from '@prisma/client';

import type { StorageMoveOperation } from '@contracts/storage';

/* ─────────────────────────────────────────────────────────────────────── */
/*  assertOperationsDontUnpublishReferencedAssets                          */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Garde de cohérence à la sortie de `published`.
 *
 * Étant donné un ensemble d'opérations de move déjà **planifiées mais
 * pas encore exécutées**, refuse l'opération si l'une d'elles ferait
 * sortir un asset **encore référencé par une page** du dossier
 * `published`.
 *
 * ─── Comment on détecte un « sort de published » ───────────────────────
 *
 * Convention applicative : le statut applicatif d'un asset = le segment
 * juste après `appRoot/` dans son `fullPath` (`published`, `pending`,
 * `bin`). Une op sort de published si son `source.path` est sous
 * `appRoot/published/` ET son `target.path` ne l'est pas.
 *
 * Les autres ops (move intra-published, ou venant d'ailleurs) sont
 * autorisées sans check — la garde ne se déclenche qu'à la sortie.
 *
 * ─── Source `folder` vs `file` ─────────────────────────────────────────
 *
 * Si la source est un dossier, ça peut emporter N assets. On élargit la
 * recherche : tous les `MediaAsset` dont `fullPath` commence par
 * `source.path + '/'` sont concernés par cette op.
 *
 * ─── Forme de l'erreur ────────────────────────────────────────────────
 *
 * Quand on refuse, on jette une `Error` avec un **diagnostic structuré
 * en clair** :
 *
 *     Cannot move out of `published`: 2 referenced asset(s) blocking.
 *     Remove these assets from the referencing pages first, then retry.
 *       - AKFC/published/cours/karate/portrait.jpg → utilisé par : Course #42, Post #17
 *       - AKFC/published/stages/2025/affiche.pdf → utilisé par : Stage_description #8
 *
 * tRPC v11 propage le `.message` côté client. Le frontend peut le
 * présenter tel quel ou le parser si jamais on veut une UI plus riche
 * plus tard.
 */
export async function assertOperationsDontUnpublishReferencedAssets(
  db: PrismaClient | Prisma.TransactionClient,
  operations: readonly StorageMoveOperation[],
  appRoot: string,
): Promise<void> {
  const publishedPrefix = `${appRoot}/published/`;

  // 1) Filtrer les ops qui sortent de published.
  const exitingOps = operations.filter(
    (op) =>
      op.source.path.startsWith(publishedPrefix) &&
      !op.target.path.startsWith(publishedPrefix),
  );

  if (exitingOps.length === 0) return;

  // 2) Pour chaque op, collecter les fullPaths concernés.
  //    Fichier : un seul path. Dossier : préfixe (assets sous le dossier).
  const filePaths = new Set<string>();
  const folderPrefixes: string[] = [];

  for (const op of exitingOps) {
    if (op.source.type === 'file') {
      filePaths.add(op.source.path);
    } else {
      // 'folder' — tout asset dont fullPath commence par <dossier>/
      folderPrefixes.push(`${op.source.path}/`);
    }
  }

  // 3) Récupérer les MediaAsset concernés.
  //    Une requête OR : id par fullPath exact OU fullPath commence par préfixe.
  const orClauses: Prisma.MediaAssetWhereInput[] = [];
  if (filePaths.size > 0) {
    orClauses.push({ fullPath: { in: [...filePaths] } });
  }
  for (const prefix of folderPrefixes) {
    orClauses.push({ fullPath: { startsWith: prefix } });
  }

  const affectedAssets = await db.mediaAsset.findMany({
    where: { OR: orClauses },
    select: { id: true, fullPath: true },
  });

  if (affectedAssets.length === 0) return;

  // 4) Chercher les références.
  const assetIds = affectedAssets.map((a) => a.id);
  const refs = await db.pageMediaReference.findMany({
    where: { mediaAssetId: { in: assetIds } },
    select: { mediaAssetId: true, pageType: true, pageId: true },
  });

  if (refs.length === 0) return;

  // 5) Construire le diagnostic et throw.
  const refsByAssetId = new Map<string, Array<{ pageType: string; pageId: string }>>();
  for (const ref of refs) {
    const list = refsByAssetId.get(ref.mediaAssetId) ?? [];
    list.push({ pageType: ref.pageType, pageId: ref.pageId });
    refsByAssetId.set(ref.mediaAssetId, list);
  }

  const blockedAssets = affectedAssets.filter((a) => refsByAssetId.has(a.id));
  const lines = blockedAssets.map((asset) => {
    const items = refsByAssetId.get(asset.id) ?? [];
    const formatted = items
      .map((r) => `${r.pageType} #${r.pageId}`)
      .join(', ');
    return `  - ${asset.fullPath} → utilisé par : ${formatted}`;
  });

  throw new Error(
    `Cannot move out of \`published\`: ${blockedAssets.length} referenced asset(s) blocking.\n` +
      `Remove these assets from the referencing pages first, then retry.\n` +
      lines.join('\n'),
  );
}
