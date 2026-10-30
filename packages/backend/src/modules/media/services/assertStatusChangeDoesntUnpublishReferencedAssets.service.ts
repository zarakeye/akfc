import { TRPCError } from '@trpc/server';
import type { Prisma, PrismaClient } from '@prisma/client';

import { physicalCandidates } from '@backend/modules/storage/logicalPath';

/* ─────────────────────────────────────────────────────────────────────── */
/*  assertStatusChangeDoesntUnpublishReferencedAssets                      */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Garde de cohérence à la sortie de `published` — version STATUT.
 *
 * ─── Pourquoi une sœur et pas un appel à l'existante ─────────────────────
 *
 * `assertOperationsDontUnpublishReferencedAssets` fait le même travail, mais
 * sa DÉTECTION est un déplacement : elle repère la sortie de `published` en
 * testant `op.source.path.startsWith(appRoot + '/published/')`. Elle a besoin
 * d'une opération, d'une source, d'une cible.
 *
 * Or dépublier cesse d'être un déplacement. Il ne reste aucune op à lui
 * donner. La brancher de force reviendrait à lui fabriquer de fausses
 * opérations pour qu'elle reconnaisse quelque chose qui n'arrive plus — un
 * chemin recopié à côté de sa source, très exactement la maladie qu'on soigne.
 *
 * Donc on réexprime la détection. Et sa nouvelle forme est plus juste que
 * l'ancienne : « être publié » n'est plus *vivre sous un préfixe*, c'est
 * `status = 'published'` en base. C'est l'inversion que tout le chantier vise,
 * appliquée à la garde elle-même.
 *
 * Les étapes 3 à 5 de l'originale (collecte des références, diagnostic, throw)
 * sont identiques : elles ne parlaient déjà que d'`id`.
 *
 * ─── Les deux gardes coexistent, et c'est voulu ──────────────────────────
 *
 * Tant que le move sait encore franchir les strates (jusqu'à l'étape 5),
 * l'originale doit rester en place : un DnD peut toujours sortir un asset de
 * `published/` par le chemin. Elle se supprimera avec la strate, à l'étape 6.
 *
 * Portée : les pages (`pageMediaReference`) ET les galeries (`galleryItems`).
 * Une galerie n'affiche que les fichiers publiés : dépublier une photo l'en
 * retirerait sans un mot, ce que la garde refuse comme pour une page.
 *
 * Le refus est un CONFLICT (TRPCError) et non une Error nue : une Error
 * devient une erreur interne, dont le message est remplacé par un message
 * neutre en production — l'administrateur ne saurait pas quelles pages
 * retirer.
 */

export type StatusChangeSource = {
  kind: 'file' | 'folder';
  path: string;
};

export async function assertStatusChangeDoesntUnpublishReferencedAssets(
  db: PrismaClient | Prisma.TransactionClient,
  sources: readonly StatusChangeSource[],
  nextStatus: 'pending' | 'published',
  appRoot: string,
  logical?: boolean,
): Promise<void> {
  // On ne garde que la SORTIE de published. Y entrer n'a jamais cassé de page.
  if (nextStatus !== 'pending') return;

  // 1) Le même matching que `media.setStatus`, à la lettre — si les deux
  //    divergeaient, la garde protégerait un ensemble et l'UPDATE en
  //    toucherait un autre.
  const orClauses: Prisma.MediaAssetWhereInput[] = [];

  for (const source of sources) {
    if (source.kind === 'file') {
      orClauses.push({ fullPath: source.path });
      orClauses.push({ fullPath: { startsWith: `${source.path}.` } });
      continue;
    }

    const prefixes = logical
      ? physicalCandidates(source.path, appRoot)
      : [source.path];

    for (const prefix of prefixes) {
      orClauses.push({ fullPath: { startsWith: `${prefix}/` } });
    }
  }

  if (orClauses.length === 0) return;

  // 2) Les assets concernés QUI SONT PUBLIÉS. `status` est la vérité : c'est
  //    ici que la garde cesse de lire le chemin.
  const affectedAssets = await db.mediaAsset.findMany({
    where: { appRoot, status: 'published', OR: orClauses },
    select: { id: true, fullPath: true },
  });

  if (affectedAssets.length === 0) return;

  // 3) Les usages : pages et galeries.
  const assetIds = affectedAssets.map((a) => a.id);
  const [refs, galleryItems] = await Promise.all([
    db.pageMediaReference.findMany({
      where: { mediaAssetId: { in: assetIds } },
      select: { mediaAssetId: true, pageType: true, pageId: true },
    }),
    db.galleryItem.findMany({
      where: { mediaAssetId: { in: assetIds } },
      select: { mediaAssetId: true, gallery: { select: { title: true } } },
    }),
  ]);

  if (refs.length === 0 && galleryItems.length === 0) return;

  // 4) Diagnostic : on nomme ce qui affiche chaque fichier, pour que
  //    l'administrateur sache quoi retirer.
  const usesByAssetId = new Map<string, string[]>();
  const addUse = (assetId: string, use: string) => {
    usesByAssetId.set(assetId, [...(usesByAssetId.get(assetId) ?? []), use]);
  };
  for (const ref of refs) addUse(ref.mediaAssetId, `${String(ref.pageType)} #${ref.pageId}`);
  for (const item of galleryItems) addUse(item.mediaAssetId, `galerie « ${item.gallery.title} »`);

  const blockedAssets = affectedAssets.filter((a) => usesByAssetId.has(a.id));
  const lines = blockedAssets.map(
    (asset) => `  - ${asset.fullPath} → utilisé par : ${(usesByAssetId.get(asset.id) ?? []).join(', ')}`,
  );

  throw new TRPCError({
    code: 'CONFLICT',
    message:
      `Dépublication impossible : ${blockedAssets.length} média(s) encore utilisé(s).\n` +
      `Retire-les des pages et des galeries qui les affichent, puis réessaie.\n` +
      lines.join('\n'),
  });
}
