import type { PrismaClient } from "@prisma/client";

import { cloudinary } from "@/server/cloudinary/cloudinary.client";
import type {
  RestoreFromBinInput,
  RestoreFromBinOutput,
  RestoreResultItem,
} from "@/shared/trash/trash.mutations";

import {
  formatBinSuffix,
  isTrashStoragePath,
  normalizePath,
  suffixFileName,
  suffixFilePath,
  suffixFolderPath,
} from "./trash.utils";

/**
 * restoreFromBin.service.ts
 *
 * Ticket 4 : restaurer un ou plusieurs contenus depuis le bin.
 *
 * Design validé :
 * - Restore vers previousPath UNIQUEMENT.
 * - Si collision => auto-rename du contenu restauré avec un suffix basé sur trashedAt.
 * - Aucune interaction / popup.
 *
 * Sécurité :
 * - storageRoot doit forcément être sous `${appRoot}/bin/.trash/`.
 * - Le backend est la source de vérité : même si l'UI se trompe, on refuse les cas dangereux.
 */

type CloudinaryResourceType = "image" | "video" | "raw";

async function getAssetInfo(publicId: string): Promise<{ resource_type: CloudinaryResourceType }> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: "authenticated",
        resource_type: rt,
      });
      if (res?.public_id) return { resource_type: rt };
    } catch {
      // try next
    }
  }
  throw new Error(`Asset not found (any resource_type): ${publicId}`);
}

async function fileExists(publicId: string): Promise<boolean> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: "authenticated",
        resource_type: rt,
      });
      if (res?.public_id) return true;
    } catch {
      // next
    }
  }
  return false;
}

async function hasAnyResourceWithPrefix(prefix: string): Promise<boolean> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resources({
        type: "authenticated",
        resource_type: rt,
        prefix,
        max_results: 1,
      });
      if ((res.resources ?? []).length > 0) return true;
    } catch {
      // ignore (treat as none)
    }
  }
  return false;
}

function statusFromPath(path: string): "pending" | "published" | "bin" {
  const parts = normalizePath(path).split("/").filter(Boolean);
  const status = parts[1];
  if (status === "pending" || status === "published" || status === "bin") return status;
  return "pending";
}

function folderAncestorsOfFolderPath(folderPath: string): string[] {
  const parts = normalizePath(folderPath).split("/").filter(Boolean);
  const out: string[] = [];
  for (let i = 1; i <= parts.length; i++) {
    out.push(parts.slice(0, i).join("/"));
  }
  return out;
}

function folderAncestorsOfPublicId(publicId: string): string[] {
  const parts = normalizePath(publicId).split("/").filter(Boolean);
  if (parts.length < 2) return [];

  // remove last segment (file name)
  const folders = parts.slice(0, -1);

  const out: string[] = [];
  for (let i = 1; i <= folders.length; i++) {
    out.push(folders.slice(0, i).join("/"));
  }
  return out;
}

async function upsertFolders(prisma: PrismaClient, appRoot: string, paths: string[]) {
  const unique = Array.from(new Set(paths.map(normalizePath))).filter(Boolean);
  if (!unique.length) return;

  await prisma.$transaction(
    unique.map((fullPath) =>
      prisma.cloudinaryFolder.upsert({
        where: { appRoot_fullPath: { appRoot, fullPath } },
        create: { appRoot, fullPath, status: statusFromPath(fullPath) },
        update: { status: statusFromPath(fullPath) },
      })
    )
  );
}

async function renameAsset(fromPublicId: string, toPublicId: string, resourceType: CloudinaryResourceType) {
  await cloudinary.uploader.rename(fromPublicId, toPublicId, {
    type: "authenticated",
    resource_type: resourceType,
    overwrite: true,
  });
}

async function moveFolderRecursively(sourcePrefix: string, targetPrefix: string) {
  for (const rt of ["image", "video", "raw"] as const) {
    let nextCursor: string | undefined;

    do {
      const res = await cloudinary.api.resources({
        type: "authenticated",
        resource_type: rt,
        prefix: sourcePrefix,
        max_results: 500,
        next_cursor: nextCursor,
      });

      for (const asset of res.resources ?? []) {
        const from = String(asset.public_id);
        const to = from.replace(sourcePrefix, targetPrefix);
        await renameAsset(from, to, rt);
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }
}

async function pathCollides(params: {
  prisma: PrismaClient;
  appRoot: string;
  kind: "file" | "folder";
  targetPath: string;
}): Promise<boolean> {
  const { prisma, appRoot, kind, targetPath } = params;
  const t = normalizePath(targetPath);

  // Collision DB (folder placeholder)
  if (kind === "folder") {
    const folder = await prisma.cloudinaryFolder.findFirst({
      where: { appRoot, fullPath: t },
      select: { id: true },
    });
    if (folder) return true;
  }

  // Collision Cloudinary
  if (kind === "file") {
    return fileExists(t);
  }

  // Folder => collision si au moins un asset existe sous prefix `${t}/`
  return hasAnyResourceWithPrefix(`${t}/`);
}

function addCounterToFolderPath(path: string, counter: number): string {
  const parts = normalizePath(path).split("/").filter(Boolean);
  if (!parts.length) return path;
  parts[parts.length - 1] = `${parts[parts.length - 1]} (${counter})`;
  return parts.join("/");
}

function addCounterToFilePath(path: string, counter: number): string {
  const parts = normalizePath(path).split("/").filter(Boolean);
  if (!parts.length) return path;

  const fileName = parts[parts.length - 1];
  parts[parts.length - 1] = suffixFileName(fileName, ` (${counter})`);
  return parts.join("/");
}

async function computeRestoredToPath(params: {
  prisma: PrismaClient;
  appRoot: string;
  kind: "file" | "folder";
  previousPath: string;
  trashedAt: Date;
}): Promise<{ restoredToPath: string; wasCollision: boolean }> {
  const { prisma, appRoot, kind, previousPath, trashedAt } = params;
  const base = normalizePath(previousPath);

  const collides = await pathCollides({ prisma, appRoot, kind, targetPath: base });
  if (!collides) return { restoredToPath: base, wasCollision: false };

  const suffix = formatBinSuffix(trashedAt);
  let candidate = kind === "folder" ? suffixFolderPath(base, suffix) : suffixFilePath(base, suffix);

  // Collision persistante (rare) => compteur
  let i = 2;
  while (await pathCollides({ prisma, appRoot, kind, targetPath: candidate })) {
    candidate = kind === "folder" ? addCounterToFolderPath(candidate, i) : addCounterToFilePath(candidate, i);
    i++;
  }

  return { restoredToPath: candidate, wasCollision: true };
}

export async function restoreFromBin(params: {
  prisma: PrismaClient;
  input: RestoreFromBinInput;
}): Promise<RestoreFromBinOutput> {
  const { prisma, input } = params;
  const appRoot = input.appRoot;

  const entries = await prisma.trashEntry.findMany({
    where: {
      appRoot,
      id: { in: input.ids },
      status: "IN_BIN",
    },
    select: {
      id: true,
      kind: true,
      displayName: true,
      previousPath: true,
      storageRoot: true,
      trashedAt: true,
    },
  });

  if (entries.length !== input.ids.length) {
    const found = new Set(entries.map((e) => e.id));
    const missing = input.ids.filter((id) => !found.has(id));
    throw new Error(`restoreFromBin: missing TrashEntry ids: ${missing.join(", ")}`);
  }

  const restored: RestoreResultItem[] = [];

  for (const entry of entries) {
    const kind: "file" | "folder" = entry.kind === "folder" ? "folder" : "file";

    // Sécurité absolue
    if (!isTrashStoragePath(appRoot, entry.storageRoot)) {
      throw new Error(`Refusing restore: storageRoot is not trash storage: ${entry.storageRoot}`);
    }

    const { restoredToPath, wasCollision } = await computeRestoredToPath({
      prisma,
      appRoot,
      kind,
      previousPath: entry.previousPath,
      trashedAt: entry.trashedAt,
    });

    // Parents DB (registry)
    if (kind === "folder") {
      await upsertFolders(prisma, appRoot, folderAncestorsOfFolderPath(restoredToPath));
    } else {
      await upsertFolders(prisma, appRoot, folderAncestorsOfPublicId(restoredToPath));
    }

    // Move Cloudinary
    if (kind === "file") {
      const info = await getAssetInfo(entry.storageRoot);
      await renameAsset(entry.storageRoot, restoredToPath, info.resource_type);
    } else {
      // IMPORTANT: trailing slash pour éviter collisions cours1 vs cours10
      await moveFolderRecursively(`${normalizePath(entry.storageRoot)}/`, `${normalizePath(restoredToPath)}/`);
    }

    await prisma.trashEntry.update({
      where: { id: entry.id },
      data: {
        status: "RESTORED",
        restoredAt: new Date(),
        restoredToPath: normalizePath(restoredToPath),
      },
    });

    restored.push({
      id: entry.id,
      kind,
      displayName: entry.displayName,
      previousPath: normalizePath(entry.previousPath),
      restoredToPath: normalizePath(restoredToPath),
      wasCollision,
      trashedAt: entry.trashedAt.toISOString(),
      renameReason: wasCollision ? "COLLISION" : undefined,
    });
  }

  return { restored };
}
