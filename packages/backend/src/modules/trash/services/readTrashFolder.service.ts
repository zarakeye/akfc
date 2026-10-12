import type { PrismaClient } from "@prisma/client";

import type {
  ReadTrashFolderInput,
  ReadTrashFolderOutput,
  TrashFileNode,
  TrashFolderNode,
  TrashMeta,
} from "@contracts/trash/trash-node.types";

import { normalizePath } from "@backend/modules/trash/utils";
import { r2ListByPrefix } from "@backend/modules/trash/services/r2TrashOps";

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

type ListedAsset = {
  /** Clé R2 de l'objet (sous le storageRoot de l'entrée). */
  key: string;
  bytes?: number;
  createdAt?: string;
};

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|svg|heic|heif|tiff?|bmp)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v|webm|mkv|avi|ogv|3gp)$/i;
const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|oga|flac|opus)$/i;

/** Nature d'un fichier de la corbeille, d'après son extension. */
function mediaKindFromKey(key: string): TrashFileNode["mediaKind"] {
  if (IMAGE_EXT.test(key)) return "image";
  if (VIDEO_EXT.test(key)) return "video";
  if (AUDIO_EXT.test(key)) return "audio";
  return "document";
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
    const key = normalizePath(a.key);
    if (key === prefix) continue;
    if (!key.startsWith(`${prefix}/`)) continue;

    const relative = key.slice(prefix.length + 1);
    const parts = relative.split("/").filter(Boolean);
    if (parts.length === 0) continue;

    if (parts.length === 1) {
      const name = parts[0];

      if (!files.has(name)) {
        files.set(name, {
          type: "file",
          name,
          fullPath: normalizePath(`${virtualPrefix}/${name}`),
          sizeBytes: a.bytes,
          createdAt: a.createdAt,
          mediaKind: mediaKindFromKey(a.key),
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

  const objects = await r2ListByPrefix(
    storagePrefix.endsWith("/") ? storagePrefix : `${storagePrefix}/`,
  );
  const assets: ListedAsset[] = objects.map((o) => ({
    key: o.key,
    bytes: o.bytes,
    createdAt: o.createdAt ? o.createdAt.toISOString() : undefined,
  }));
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