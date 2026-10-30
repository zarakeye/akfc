import { TRPCError } from "@trpc/server";
import { rewriteAssetPaths } from "@backend/modules/storage/mediaPaths";
import type { PrismaClient } from "@prisma/client";

import type {
  RestoreFromBinInput,
  RestoreFromBinOutput,
  RestoreResultItem,
} from "@contracts/trash/trash.mutations";

import {
  formatBinSuffix,
  isTrashStoragePath,
  normalizePath,
  suffixFileName,
  suffixFilePath,
  suffixFolderPath,
} from "@backend/modules/trash/utils";
import { pruneEmptyFolders } from "@backend/modules/storage/services/pruneEmptyFolders.service";
import {
  r2Exists,
  r2ListByPrefix,
  r2MoveFile,
  r2MoveFolder,
} from "@backend/modules/trash/services/r2TrashOps";

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

/** Existe-t-il au moins un objet sous ce préfixe ? */
async function hasAnyObjectWithPrefix(prefix: string): Promise<boolean> {
  return (await r2ListByPrefix(prefix)).length > 0;
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

function folderAncestorsOfFilePath(filePath: string): string[] {
  const parts = normalizePath(filePath).split("/").filter(Boolean);
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
      prisma.folder.upsert({
        where: { appRoot_fullPath: { appRoot, fullPath } },
        create: { appRoot, fullPath, status: statusFromPath(fullPath) },
        update: { status: statusFromPath(fullPath) },
      })
    )
  );
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
    const folder = await prisma.folder.findFirst({
      where: { appRoot, fullPath: t },
      select: { id: true },
    });
    if (folder) return true;
  }

  // Collision de fichier
  if (kind === "file") {
    return r2Exists(t);
  }

  // Folder => collision si au moins un objet existe sous prefix `${t}/`
  return hasAnyObjectWithPrefix(`${t}/`);
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
    // Deux administrateurs sur la même corbeille : l'autre a déjà restauré ou supprimé.
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `${missing.length} élément(s) déjà restauré(s) ou supprimé(s). Actualisez la corbeille.`,
    });
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
      await upsertFolders(prisma, appRoot, folderAncestorsOfFilePath(restoredToPath));
    }

    // Move physique, puis les lignes MediaAsset reviennent avec leurs objets — à leur chemin
    // d'origine, ou À CÔTÉ en cas de collision : le fichier restauré garde son statut, son nom
    // d'origine et sa description où qu'il atterrisse. (Un élément jeté avant que les lignes
    // suivent leurs objets n'en a aucune sous `storageRoot` : la réécriture ne touche alors rien,
    // et ses lignes, restées au chemin d'origine, le retrouvent s'il y revient.)
    //
    // Pas de transaction commune entre le stockage et la base : si la base échoue, les objets
    // retournent en quarantaine et l'entrée reste « dans la corbeille ».
    const storageRoot = normalizePath(entry.storageRoot);
    const target = normalizePath(restoredToPath);
    const moveObjects = (from: string, to: string): Promise<void> =>
      kind === "file" ? r2MoveFile(from, to) : r2MoveFolder(`${from}/`, `${to}/`);

    await moveObjects(storageRoot, target);
    try {
      await rewriteAssetPaths(prisma, appRoot, kind, storageRoot, target);
    } catch (err) {
      await moveObjects(target, storageRoot).catch((undoErr) => {
        console.error("[trash] restauration : objets non ramenés en quarantaine", entry.id, undoErr);
      });
      throw err;
    }

    await prisma.trashEntry.update({
      where: { id: entry.id },
      data: {
        status: "RESTORED",
        restoredAt: new Date(),
        restoredToPath: normalizePath(restoredToPath),
      },
    });

    // ─── La quarantaine vient d'être vidée : elle doit mourir ──────────
    //
    // `trashToBin` fait le ménage à l'aller (il supprime les lignes `Folder`
    // du dossier source). Personne ne le faisait au retour : les assets
    // sortent du wrapper `bin/.trash/<uuid>`, et sa ligne `Folder` survit.
    // Le finder bâtissant son arbre sur cette table, un chevron persistait
    // sur une corbeille visuellement vide.
    //
    // `pruneEmptyFolders` vérifie qu'aucun objet ne subsiste avant de
    // supprimer un palier, puis remonte : le wrapper, puis
    // `.trash` s'il ne reste plus rien, et s'arrête sur `${appRoot}/bin` que
    // sa borne `minDepth` protège.
    const wrapperPath =
      kind === "folder"
        ? normalizePath(entry.storageRoot)
        : // Pour un fichier, `storageRoot` EST la clé de l'objet : son
          // dossier est son parent. Peu importe si on démarre plus profond
          // que le wrapper, le prune remonte.
          normalizePath(entry.storageRoot).split("/").slice(0, -1).join("/");

    await pruneEmptyFolders({ prisma, appRoot, startFolderPath: wrapperPath });

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