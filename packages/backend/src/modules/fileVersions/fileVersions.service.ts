import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  FILE_VERSION_MAX_AGE_DAYS,
  FILE_VERSIONS_KEPT,
  type FileVersionsOutput,
} from "@contracts/fileVersions/fileVersion.dto";

import { getR2Bucket, getR2PresignClient } from "@backend/modules/storage/adapters/r2/client";
import { r2CopyFile, r2DeleteFile, r2ListByPrefix } from "@backend/modules/trash/services/r2TrashOps";
import { deleteDerivatives } from "@backend/modules/media/services/mediaDerivatives.service";
import { groupIdFromLogicalPath } from "@backend/modules/memberGroups/assertCanTrashPaths.service";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";

/*
 * Versions des fichiers.
 *
 *   - Remplacer un fichier (envoi confirmé d'un fichier du même nom au même endroit) copie d'abord
 *     le contenu actuel sous _versions/{mediaAssetId}/{versionId} : createR2Upload prépare la
 *     version (non confirmée), registerR2Upload la confirme une fois le nouveau contenu arrivé.
 *     Un envoi abandonné laisse une version non confirmée : invisible, purgée après un jour.
 *   - Les versions sont rattachées à la ligne MediaAsset, pas au chemin : elles suivent le fichier
 *     quand il est renommé, déplacé, mis à la corbeille et restauré, et partent avec lui.
 *   - Restaurer une version : le contenu actuel devient à son tour une version, puis la version
 *     choisie est recopiée à la place du fichier (et retirée de la liste : c'est le contenu actuel).
 *   - Conservation : les 10 plus récentes de chaque fichier, et pas plus d'un an (purge de nuit).
 *   - Droits : voir les versions = admin, ou membre de l'espace du groupe ; restaurer = admin, ou
 *     éditeur de l'espace du groupe ; supprimer une version = admin.
 */

/** Préfixe des objets de versions, hors de l'arborescence du club (comme _derived/). */
export const VERSIONS_ROOT = "_versions/";

const DAY_MS = 24 * 3600 * 1000;

type User = { id: string; isAdmin: boolean };

const assetSelect = {
  id: true,
  fullPath: true,
  originalFileName: true,
  mimeType: true,
  bytes: true,
  width: true,
  height: true,
  duration: true,
  uploaderUserId: true,
  uploadedAt: true,
} as const;

type AssetRow = {
  id: string;
  fullPath: string;
  originalFileName: string;
  mimeType: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  uploaderUserId: string | null;
  uploadedAt: Date;
};

function nameOf(u: { firstName: string | null; lastName: string | null; email: string } | null): string | null {
  if (!u) return null;
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

/* ------------------------------------------------------------------------------------------ */
/*  Droits                                                                                     */
/* ------------------------------------------------------------------------------------------ */

async function groupAccessOf(prisma: PrismaClient, user: User, fullPath: string) {
  const groupId = groupIdFromLogicalPath(fullPath);
  return groupId ? resolveGroupAccessForUser(prisma, user.id, groupId) : "NONE";
}

/** Peut restaurer une version : admin, ou éditeur de l'espace du groupe. */
async function mayRestore(prisma: PrismaClient, user: User, fullPath: string): Promise<boolean> {
  return user.isAdmin || (await groupAccessOf(prisma, user, fullPath)) === "EDITOR";
}

async function assertMayRead(prisma: PrismaClient, user: User, fullPath: string): Promise<void> {
  if (user.isAdmin) return;
  if ((await groupAccessOf(prisma, user, fullPath)) !== "NONE") return;
  throw new TRPCError({ code: "FORBIDDEN", message: "Versions réservées aux membres de cet espace." });
}

/* ------------------------------------------------------------------------------------------ */
/*  Création d'une version                                                                     */
/* ------------------------------------------------------------------------------------------ */

/** Copie le contenu actuel du fichier en version. */
async function snapshot(prisma: PrismaClient, asset: AssetRow, confirmed: boolean): Promise<string> {
  const row = await prisma.fileVersion.create({
    data: {
      mediaAssetId: asset.id,
      // Clé provisoire, remplacée juste après : elle contient l'identifiant de la ligne.
      storageKey: `${VERSIONS_ROOT}${asset.id}/pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      originalFileName: asset.originalFileName,
      mimeType: asset.mimeType,
      bytes: asset.bytes,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      authorId: asset.uploaderUserId,
      uploadedAt: asset.uploadedAt,
      confirmed,
    },
    select: { id: true },
  });
  const storageKey = `${VERSIONS_ROOT}${asset.id}/${row.id}`;
  try {
    await r2CopyFile(asset.fullPath, storageKey);
  } catch (err) {
    await prisma.fileVersion.delete({ where: { id: row.id } });
    throw err;
  }
  await prisma.fileVersion.update({ where: { id: row.id }, data: { storageKey } });
  return row.id;
}

async function dropVersions(prisma: PrismaClient, rows: { id: string; storageKey: string }[]): Promise<number> {
  for (const r of rows) {
    await r2DeleteFile(r.storageKey).catch((err) => {
      console.error(`[versions] objet ${r.storageKey} :`, err instanceof Error ? err.message : err);
    });
  }
  if (rows.length === 0) return 0;
  const { count } = await prisma.fileVersion.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
  return count;
}

/**
 * Avant un remplacement (createR2Upload, écrasement confirmé) : garde le contenu actuel en
 * version NON confirmée. Une demande d'envoi répétée ne multiplie pas les copies.
 */
export async function prepareReplacement(prisma: PrismaClient, fullPath: string): Promise<void> {
  const asset = await prisma.mediaAsset.findUnique({ where: { fullPath }, select: assetSelect });
  if (!asset) return;
  const stale = await prisma.fileVersion.findMany({
    where: { mediaAssetId: asset.id, confirmed: false },
    select: { id: true, storageKey: true },
  });
  await dropVersions(prisma, stale);
  await snapshot(prisma, asset, false);
}

/**
 * Après le remplacement (registerR2Upload) : la version préparée devient visible, les vignettes de
 * l'ancien contenu sont effacées, et la conservation s'applique au fichier.
 */
export async function confirmReplacement(prisma: PrismaClient, mediaAssetId: string, fullPath: string): Promise<void> {
  await prisma.fileVersion.updateMany({ where: { mediaAssetId, confirmed: false }, data: { confirmed: true } });
  await deleteDerivatives(fullPath).catch(() => 0);
  await applyRetention(prisma, mediaAssetId);
}

/** Les 10 plus récentes, et pas plus d'un an. */
async function applyRetention(prisma: PrismaClient, mediaAssetId: string, now = new Date()): Promise<number> {
  const rows = await prisma.fileVersion.findMany({
    where: { mediaAssetId, confirmed: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { id: true, storageKey: true, createdAt: true },
  });
  const cutoff = now.getTime() - FILE_VERSION_MAX_AGE_DAYS * DAY_MS;
  const expired = rows.filter((r, i) => i >= FILE_VERSIONS_KEPT || r.createdAt.getTime() < cutoff);
  return dropVersions(prisma, expired);
}

/* ------------------------------------------------------------------------------------------ */
/*  Lecture, téléchargement, restauration, suppression                                         */
/* ------------------------------------------------------------------------------------------ */

export async function listVersions(params: {
  prisma: PrismaClient;
  user: User;
  fullPath: string;
}): Promise<FileVersionsOutput> {
  const { prisma, user, fullPath } = params;
  const asset = await prisma.mediaAsset.findUnique({
    where: { fullPath },
    select: { ...assetSelect, uploader: { select: { firstName: true, lastName: true, email: true } } },
  });
  if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Fichier introuvable." });
  await assertMayRead(prisma, user, asset.fullPath);

  const versions = await prisma.fileVersion.findMany({
    where: { mediaAssetId: asset.id, confirmed: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      originalFileName: true,
      mimeType: true,
      bytes: true,
      uploadedAt: true,
      createdAt: true,
      author: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return {
    mediaAssetId: asset.id,
    fullPath: asset.fullPath,
    current: {
      originalFileName: asset.originalFileName,
      mimeType: asset.mimeType,
      bytes: asset.bytes,
      authorName: nameOf(asset.uploader),
      uploadedAt: asset.uploadedAt.toISOString(),
    },
    versions: versions.map((v) => ({
      id: v.id,
      originalFileName: v.originalFileName,
      mimeType: v.mimeType,
      bytes: v.bytes,
      authorName: nameOf(v.author),
      uploadedAt: v.uploadedAt.toISOString(),
      replacedAt: v.createdAt.toISOString(),
    })),
    canRestore: await mayRestore(prisma, user, asset.fullPath),
    canDelete: user.isAdmin,
  };
}

async function findVersion(prisma: PrismaClient, versionId: string) {
  const v = await prisma.fileVersion.findFirst({
    where: { id: versionId, confirmed: true },
    select: {
      id: true,
      storageKey: true,
      originalFileName: true,
      mimeType: true,
      bytes: true,
      width: true,
      height: true,
      duration: true,
      authorId: true,
      uploadedAt: true,
      mediaAsset: { select: assetSelect },
    },
  });
  if (!v) throw new TRPCError({ code: "NOT_FOUND", message: "Version introuvable : elle a peut-être déjà été restaurée ou effacée." });
  return v;
}

/** Lien de téléchargement (10 minutes), sous le nom d'origine de la version. */
export async function versionDownloadUrl(params: { prisma: PrismaClient; user: User; versionId: string }): Promise<string> {
  const v = await findVersion(params.prisma, params.versionId);
  await assertMayRead(params.prisma, params.user, v.mediaAsset.fullPath);
  const name = v.originalFileName.replace(/["\\\r\n]/g, "_");
  // Signé pour le navigateur (adresse publique du stockage), comme les envois.
  return getSignedUrl(
    getR2PresignClient(),
    new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: v.storageKey,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      ResponseContentType: v.mimeType,
    }),
    { expiresIn: 600 },
  );
}

/**
 * Restaure une version : le contenu actuel devient une version (confirmée), puis la version est
 * recopiée à la place du fichier ; la ligne reprend ses caractéristiques (taille, type, nom
 * d'origine, auteur, date de dépôt). La version restaurée quitte la liste.
 */
export async function restoreVersion(params: { prisma: PrismaClient; user: User; versionId: string }): Promise<{ fullPath: string }> {
  const { prisma, user } = params;
  const v = await findVersion(prisma, params.versionId);
  const asset = v.mediaAsset;
  if (!(await mayRestore(prisma, user, asset.fullPath))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Restauration réservée aux admins et aux éditeurs de cet espace." });
  }

  await snapshot(prisma, asset, true);
  await r2CopyFile(v.storageKey, asset.fullPath);
  await prisma.mediaAsset.update({
    where: { id: asset.id },
    data: {
      originalFileName: v.originalFileName,
      mimeType: v.mimeType,
      bytes: v.bytes,
      width: v.width,
      height: v.height,
      duration: v.duration,
      uploaderUserId: v.authorId,
      uploadedAt: v.uploadedAt,
    },
  });
  await dropVersions(prisma, [v]);
  await deleteDerivatives(asset.fullPath).catch(() => 0);
  await applyRetention(prisma, asset.id);
  return { fullPath: asset.fullPath };
}

export async function deleteVersion(params: { prisma: PrismaClient; user: User; versionId: string }): Promise<void> {
  if (!params.user.isAdmin) throw new TRPCError({ code: "FORBIDDEN", message: "Réservé aux admins." });
  const v = await findVersion(params.prisma, params.versionId);
  await dropVersions(params.prisma, [v]);
}

/* ------------------------------------------------------------------------------------------ */
/*  Purge de nuit                                                                              */
/* ------------------------------------------------------------------------------------------ */

/**
 * Versions non confirmées depuis plus d'un jour, versions de plus d'un an ou au-delà des 10 plus
 * récentes d'un fichier, et objets de versions sans ligne (fichier supprimé définitivement : la
 * ligne est partie en cascade, l'objet reste à effacer).
 */
export async function purgeFileVersions(prisma: PrismaClient, now = new Date()): Promise<number> {
  const dayAgo = new Date(now.getTime() - DAY_MS);
  const unconfirmed = await prisma.fileVersion.findMany({
    where: { confirmed: false, createdAt: { lt: dayAgo } },
    select: { id: true, storageKey: true },
  });
  let n = await dropVersions(prisma, unconfirmed);

  const assets = await prisma.fileVersion.groupBy({ by: ["mediaAssetId"], where: { confirmed: true } });
  for (const a of assets) n += await applyRetention(prisma, a.mediaAssetId, now);

  const objects = await r2ListByPrefix(VERSIONS_ROOT);
  const known = new Set(
    (await prisma.fileVersion.findMany({ select: { storageKey: true } })).map((r) => r.storageKey),
  );
  for (const o of objects) {
    // Un objet tout juste copié peut précéder la mise à jour de sa ligne : on laisse un jour.
    if (known.has(o.key) || (o.createdAt && o.createdAt > dayAgo)) continue;
    await r2DeleteFile(o.key).catch(() => undefined);
    n += 1;
  }
  return n;
}
