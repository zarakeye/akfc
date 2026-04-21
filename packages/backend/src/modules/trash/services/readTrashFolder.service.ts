import type { PrismaClient } from "@prisma/client";

import { cloudinary } from "@workspace/backend/modules/cloudinary/cloudinary.client";
import type {
  ReadTrashFolderInput,
  ReadTrashFolderOutput,
  TrashFileNode,
  TrashFolderNode,
  TrashMeta,
} from "@workspace/contracts/src/trash/trash-node.types";

import { normalizePath } from "@workspace/backend/modules/trash/utils";

/**
 * readTrashFolder.service.ts
 *
 * Navigation lecture seule dans un dossier "trash".
 *
 * Important :
 * - Le path affiché est virtuel (AKFC/bin/<displayName>/...)
 * - Le stockage réel est storageRoot (ex: AKFC/bin/.trash/<id>/cours1)
 * - On renvoie seulement les enfants directs (choix A validé)
 */

type CloudinaryResourceType = "image" | "video" | "raw";

type ListedAsset = {
  publicId: string;
  bytes?: number;
  createdAt?: string;
};

/**
 * Liste tous les assets sous un prefix (authenticated) pour image/video/raw.
 *
 * NOTE perf:
 * - on pagine par 500.
 * - en cas de gros dossiers, cette liste peut être lourde.
 *   On optimise plus tard si nécessaire (cache, listing par "subfolders", etc.).
 */
async function listAssetsByPrefix(prefix: string): Promise<ListedAsset[]> {
  const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];
  const out: ListedAsset[] = [];

  for (const resource_type of resourceTypes) {
    let nextCursor: string | undefined;

    do {
      const res = await cloudinary.api.resources({
        type: "authenticated",
        resource_type,
        prefix,
        max_results: 500,
        next_cursor: nextCursor,
      });

      for (const asset of res.resources ?? []) {
        out.push({
          publicId: asset.public_id as string,
          bytes: typeof asset.bytes === "number" ? asset.bytes : undefined,
          createdAt: asset.created_at ? String(asset.created_at) : undefined,
        });
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }

  return out;
}

/**
 * À partir d'une liste d'assets sous un prefix, extrait les enfants directs:
 * - folders: premier segment relatif
 * - files  : segment unique relatif
 */
function computeDirectChildren(params: {
  assets: ListedAsset[];
  storagePrefix: string;
  virtualPrefix: string;
  meta: TrashMeta;
}): Array<TrashFolderNode | TrashFileNode> {
  const { assets, storagePrefix, virtualPrefix, meta } = params;

  const prefix = normalizePath(storagePrefix);
  const folders = new Map<string, TrashFolderNode>();
  const files = new Map<string, TrashFileNode>();

  for (const a of assets) {
    const publicId = normalizePath(a.publicId);
    if (publicId === prefix) continue;
    if (!publicId.startsWith(`${prefix}/`)) continue;

    const relative = publicId.slice(prefix.length + 1);
    const parts = relative.split("/").filter(Boolean);
    if (parts.length === 0) continue;

    if (parts.length === 1) {
      const name = parts[0];

      if (!files.has(name)) {
        files.set(name, {
          type: "file",
          name,
          fullPath: normalizePath(`${virtualPrefix}/${name}`),
          publicId: a.publicId,
          sizeBytes: a.bytes,
          createdAt: a.createdAt,
          meta,
        });
      }

      continue;
    }

    const folderName = parts[0];

    if (!folders.has(folderName)) {
      folders.set(folderName, {
        type: "folder",
        name: folderName,
        fullPath: normalizePath(`${virtualPrefix}/${folderName}`),
        children: [],
        meta,
      });
    }
  }

  const folderNodes = Array.from(folders.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const fileNodes = Array.from(files.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return [...folderNodes, ...fileNodes];
}

export async function readTrashFolder(params: {
  prisma: PrismaClient;
  input: ReadTrashFolderInput;
}): Promise<ReadTrashFolderOutput> {
  const { prisma, input } = params;
  const relativePath = normalizePath(input.relativePath ?? "");

  const entry = await prisma.trashEntry.findFirst({
    where: {
      id: input.trashId,
      appRoot: input.appRoot,
      status: "IN_BIN",
    },
    select: {
      id: true,
      kind: true,
      displayName: true,
      previousPath: true,
      trashedAt: true,
      storageRoot: true,
    },
  });

  if (!entry) {
    throw new Error("TrashEntry not found (or not in bin)");
  }

  if (entry.kind !== "folder") {
    throw new Error("readTrashFolder can only open folder trash entries");
  }

  const storagePrefix = normalizePath(
    relativePath ? `${entry.storageRoot}/${relativePath}` : entry.storageRoot
  );

  const virtualPrefix = normalizePath(
    relativePath
      ? `${input.appRoot}/bin/${entry.displayName}/${relativePath}`
      : `${input.appRoot}/bin/${entry.displayName}`
  );

  const meta: TrashMeta = {
    kind: "trash",
    trashId: entry.id,
    previousPath: entry.previousPath,
    trashedAt: entry.trashedAt.toISOString(),
  };

  const assets = await listAssetsByPrefix(storagePrefix);
  const children = computeDirectChildren({
    assets,
    storagePrefix,
    virtualPrefix,
    meta,
  });

  const name =
    virtualPrefix.split("/").filter(Boolean).pop() ?? entry.displayName;

  const folder: TrashFolderNode = {
    type: "folder",
    name,
    fullPath: virtualPrefix,
    children,
    meta,
  };

  return {
    folder,
    displayPath: virtualPrefix,
  };
}