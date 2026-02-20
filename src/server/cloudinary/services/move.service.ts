import { cloudinary } from '@/server/cloudinary/cloudinary.client';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import {
  replaceStatusSegment,
  moveFileIntoFolder,
} from '@server/cloudinary/utils/cloudinary.utils';

/**
 * move.service.ts
 *
 * Objectif:
 * - Supporter tous les moves unitaires (déjà OK)
 * - ✅ Supporter le multi-select: source.type === "selection"
 *   - selection -> virtual-folder (changement de statut)
 *   - selection -> folder (drop dans un vrai dossier)
 *
 * Notes importantes:
 * - Cloudinary distingue resource_type: image | video | raw
 * - Pour que rename marche dans tous les cas, on récupère resource_type
 *   et on le passe à uploader.rename().
 */

type CloudinaryResourceType = 'image' | 'video' | 'raw';

type ListedAsset = {
  public_id: string;
  resource_type: CloudinaryResourceType;
};

export async function moveService(intent: MoveIntent): Promise<void> {
  const { source, target } = intent;

  console.log('Executing move intent:', intent);

  /**
   * ---------------------------------------------------------------------------
   * ✅ 0) MULTI-SELECT
   * ---------------------------------------------------------------------------
   */
  if (source.type === 'selection') {
    // Matérialiser la sélection (roots/excluded) en assets (public_id + resource_type)
    const assets = await collectSelectedAssets({
      roots: source.roots,
      excluded: source.excluded ?? [],
    });

    // Dedup par public_id (au cas où roots se recoupent)
    const dedup = new Map<string, ListedAsset>();
    for (const a of assets) dedup.set(a.public_id, a);
    const uniqueAssets = Array.from(dedup.values());

    // ---------- selection -> virtual-folder ----------
    if (target.type === 'virtual-folder') {
      for (const asset of uniqueAssets) {
        const nextPublicId = replaceStatusSegment(asset.public_id, target.status);

        // no-op : déjà dans le bon status
        if (nextPublicId === asset.public_id) continue;

        await renameAsset(asset.public_id, nextPublicId, asset.resource_type);
      }
      return;
    }

    // ---------- selection -> folder ----------
    if (target.type === 'folder') {
      /**
       * IMPORTANT:
       * - On doit préserver la structure pour les dossiers sélectionnés.
       * - Mais ici on a seulement les assets. Donc on fait du renommage "par root":
       *   - si root est un fichier => moveFileIntoFolder
       *   - si root est un dossier => replace prefix root -> target/fullFolderName
       *
       * Pour ça, on va exécuter les moves root par root, en tenant compte des excluded.
       */
      await moveSelectionIntoFolder({
        roots: source.roots,
        excluded: source.excluded ?? [],
        targetFolder: target.fullPath,
      });

      return;
    }

    throw new Error('Invalid target for selection');
  }

  /**
   * ---------------------------------------------------------------------------
   * 1) FILE / FOLDER -> VIRTUAL
   * ---------------------------------------------------------------------------
   */
  if (target.type === 'virtual-folder') {
    const newPrefix = replaceStatusSegment(source.fullPath, target.status);

    if (source.type === 'file') {
      const info = await getAssetInfo(source.fullPath);
      await renameAsset(source.fullPath, newPrefix, info.resource_type);
    } else {
      await moveFolderRecursively(source.fullPath, newPrefix);
    }

    return;
  }

  /**
   * ---------------------------------------------------------------------------
   * 2) FILE / FOLDER -> FOLDER
   * ---------------------------------------------------------------------------
   */
  if (target.type === 'folder') {
    if (source.type === 'file') {
      const newPath = moveFileIntoFolder(source.fullPath, target.fullPath);
      const info = await getAssetInfo(source.fullPath);
      await renameAsset(source.fullPath, newPath, info.resource_type);
    } else {
      const folderName = source.fullPath.split('/').pop();
      if (!folderName) return;

      const targetPrefix = `${target.fullPath}/${folderName}`;
      await moveFolderRecursively(source.fullPath, targetPrefix);
    }

    return;
  }

  throw new Error('Invalid move intent');
}

/**
 * ---------------------------------------------------------------------------
 * Cloudinary helpers
 * ---------------------------------------------------------------------------
 */

async function renameAsset(from: string, to: string, resourceType: CloudinaryResourceType) {
  // ✅ on passe resource_type pour que rename marche (image/video/raw)
  await cloudinary.uploader.rename(from, to, {
    type: 'authenticated',
    resource_type: resourceType,
    overwrite: true,
  });
}

async function getAssetInfo(publicId: string): Promise<{ resource_type: CloudinaryResourceType }> {
  // cloudinary.api.resource() nécessite le bon resource_type, donc on essaie les 3
  for (const rt of ['image', 'video', 'raw'] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: 'authenticated',
        resource_type: rt,
      });
      if (res?.public_id) return { resource_type: rt };
    } catch {
      // continue
    }
  }
  throw new Error(`Asset not found (any resource_type): ${publicId}`);
}

async function listAssetsByPrefix(prefix: string): Promise<ListedAsset[]> {
  const out: ListedAsset[] = [];

  for (const rt of ['image', 'video', 'raw'] as const) {
    let nextCursor: string | undefined;

    do {
      const res = await cloudinary.api.resources({
        type: 'authenticated',
        resource_type: rt,
        prefix,
        max_results: 500,
        next_cursor: nextCursor,
      });

      for (const asset of res.resources) {
        out.push({
          public_id: asset.public_id,
          resource_type: rt,
        });
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }

  return out;
}

async function moveFolderRecursively(sourcePrefix: string, targetPrefix: string) {
  /**
   * Version robuste: on bouge image/video/raw, paginé.
   * (Ton ancienne version ne gérait qu’un type implicite et une pagination partielle selon usage.)
   */
  for (const rt of ['image', 'video', 'raw'] as const) {
    let nextCursor: string | undefined;

    do {
      const res = await cloudinary.api.resources({
        type: 'authenticated',
        resource_type: rt,
        prefix: sourcePrefix,
        max_results: 500,
        next_cursor: nextCursor,
      });

      for (const asset of res.resources) {
        const newPublicId = asset.public_id.replace(sourcePrefix, targetPrefix);
        await renameAsset(asset.public_id, newPublicId, rt);
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }
}

/**
 * ---------------------------------------------------------------------------
 * ✅ Multi-select resolver: roots/excluded -> liste d'assets
 * ---------------------------------------------------------------------------
 */

async function collectSelectedAssets(input: {
  roots: string[];
  excluded: string[];
}): Promise<ListedAsset[]> {
  const excluded = input.excluded ?? [];

  const isExcluded = (publicId: string) =>
    excluded.some((ex) => publicId === ex || publicId.startsWith(`${ex}/`));

  const out: ListedAsset[] = [];

  for (const root of input.roots) {
    if (isExcluded(root)) continue;

    // 1) root est-il un asset ?
    const asset = await tryGetAsset(root);
    if (asset) {
      if (!isExcluded(asset.public_id)) out.push(asset);
      continue;
    }

    // 2) sinon root est un dossier => liste tous les assets sous le prefix
    const assetsUnder = await listAssetsByPrefix(root);
    for (const a of assetsUnder) {
      if (!isExcluded(a.public_id)) out.push(a);
    }
  }

  return out;
}

async function tryGetAsset(publicId: string): Promise<ListedAsset | null> {
  for (const rt of ['image', 'video', 'raw'] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: 'authenticated',
        resource_type: rt,
      });
      if (res?.public_id) {
        return { public_id: res.public_id as string, resource_type: rt };
      }
    } catch {
      // continue
    }
  }
  return null;
}

/**
 * ---------------------------------------------------------------------------
 * ✅ selection -> folder (préserve la structure des dossiers sélectionnés)
 * ---------------------------------------------------------------------------
 *
 * On traite root par root (pas juste "assets globaux") pour:
 * - fichier root => moveFileIntoFolder
 * - dossier root => move sous targetFolder en conservant le nom du dossier
 *
 * On respecte excluded (fichier ou dossier) via la même règle "prefix".
 */
async function moveSelectionIntoFolder(params: {
  roots: string[];
  excluded: string[];
  targetFolder: string;
}) {
  const { roots, excluded, targetFolder } = params;

  const isExcluded = (publicId: string) =>
    excluded.some((ex) => publicId === ex || publicId.startsWith(`${ex}/`));

  for (const root of roots) {
    if (isExcluded(root)) continue;

    // root asset ?
    const asset = await tryGetAsset(root);
    if (asset) {
      const newPath = moveFileIntoFolder(asset.public_id, targetFolder);
      await renameAsset(asset.public_id, newPath, asset.resource_type);
      continue;
    }

    // root folder => déplacer sous targetFolder en gardant folderName
    const folderName = root.split('/').pop();
    if (!folderName) continue;

    const targetPrefix = `${targetFolder}/${folderName}`;

    // On liste tous les assets sous root et on renomme root -> targetPrefix (en respectant excluded)
    const assetsUnder = await listAssetsByPrefix(root);
    for (const a of assetsUnder) {
      if (isExcluded(a.public_id)) continue;

      const newPublicId = a.public_id.replace(root, targetPrefix);
      await renameAsset(a.public_id, newPublicId, a.resource_type);
    }
  }
}
