import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@prisma/client";

import { fetchAuthenticatedAsset } from "@backend/modules/cloudinary/services/cloudinary.service";
import { isR2AvatarKey } from "@backend/modules/avatar/avatar.service";
import { getR2Bucket, getR2Client } from "@backend/modules/storage/adapters/r2/client";

/*
 * Migration Cloudinary → R2 (sortie de Cloudinary, plan A). Par lots courts, relançable sans risque :
 *   - chaque MediaAsset encore chez Cloudinary (publicId non nul, hors corbeille) est copié dans R2
 *     à son `fullPath` (public_id + extension), puis basculé : publicId, secureUrl, resourceType et
 *     cloudinaryAssetId remis à null, ancien public_id gardé dans legacyCloudinaryPublicId ;
 *   - chaque avatar encore chez Cloudinary est copié sous `<racine>/avatars/<id>/` ;
 *   - rien n'est supprimé chez Cloudinary : la copie y reste en secours jusqu'à la fermeture du compte.
 * Les fichiers à la corbeille ne sont PAS migrés : vider ou restaurer la corbeille avant.
 */

const MAX_FILE_BYTES = 500 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "audio/mpeg": "mp3",
  "application/pdf": "pdf",
};

const hasExtension = (path: string): boolean => /\.[A-Za-z0-9]{1,8}$/.test(path.split("/").pop() ?? "");

async function r2Has(key: string): Promise<number | null> {
  try {
    const head = await getR2Client().send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: key }));
    return head.ContentLength ?? 0;
  } catch {
    return null;
  }
}

async function download(publicId: string, format: string | null): Promise<{ body: Buffer; contentType: string }> {
  const res = await fetchAuthenticatedAsset(publicId, "original", undefined, format ?? undefined);
  if (!res || !res.ok || !res.body) throw new Error("introuvable chez Cloudinary");
  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_FILE_BYTES) throw new Error("fichier trop volumineux pour la migration automatique");
  const body = Buffer.from(await res.arrayBuffer());
  if (body.length === 0) throw new Error("fichier vide chez Cloudinary");
  return { body, contentType: res.headers.get("content-type") ?? "application/octet-stream" };
}

async function upload(key: string, body: Buffer, contentType: string): Promise<void> {
  await getR2Client().send(new PutObjectCommand({ Bucket: getR2Bucket(), Key: key, Body: body, ContentType: contentType }));
}

export type MigrationStatus = {
  remaining: number;
  migrated: number;
  inBin: number;
  avatarsRemaining: number;
  /** Contenus rédigés qui contiennent encore une adresse Cloudinary (à vérifier à la main). */
  contentWithCloudinaryUrls: Array<{ table: string; count: number }>;
};

const CONTENT_COLUMNS: Array<[string, string]> = [
  ["SitePage", "content"],
  ["Post", "content"],
  ["Course", "content"],
  ["Discipline", "description"],
  ["Discipline", "summary"],
  ["Event", "content"],
  ["Event", "summary"],
  ["Seminar", "description"],
  ["Seminar", "program"],
  ["Seminar", "summary"],
  ["Comment", "content"],
  ["User", "instructorBio"],
];

export async function cloudinaryMigrationStatus(db: PrismaClient): Promise<MigrationStatus> {
  const [remaining, migrated, inBin, avatarUsers] = await Promise.all([
    db.mediaAsset.count({ where: { publicId: { not: null }, status: { not: "bin" } } }),
    db.mediaAsset.count({ where: { legacyCloudinaryPublicId: { not: null } } }),
    db.mediaAsset.count({ where: { publicId: { not: null }, status: "bin" } }),
    db.user.findMany({ where: { avatar: { not: null } }, select: { avatar: true } }),
  ]);
  const contentWithCloudinaryUrls: MigrationStatus["contentWithCloudinaryUrls"] = [];
  for (const [table, column] of CONTENT_COLUMNS) {
    // Noms de table et de colonne : liste fixe ci-dessus, jamais une saisie.
    const rows = await db.$queryRawUnsafe<Array<{ n: bigint }>>(
      `SELECT COUNT(*)::bigint AS n FROM "${table}" WHERE "${column}"::text LIKE '%by-public-id%' OR "${column}"::text LIKE '%res.cloudinary.com%'`,
    );
    const count = Number(rows[0]?.n ?? 0);
    if (count > 0) contentWithCloudinaryUrls.push({ table: `${table}.${column}`, count });
  }
  return {
    remaining,
    migrated,
    inBin,
    avatarsRemaining: avatarUsers.filter((u) => u.avatar && !isR2AvatarKey(u.avatar)).length,
    contentWithCloudinaryUrls,
  };
}

/** `id` : identifiant du fichier, ou `user:<id>` pour un avatar (à renvoyer dans `exclude` en cas d'échec). */
export type MigrationItem = { id: string; kind: "file" | "avatar"; name: string; ok: boolean; error?: string };

/**
 * Migre au plus `max` fichiers (puis les avatars une fois les fichiers terminés). `exclude` : éléments
 * déjà en échec dans cette session, écartés pour que la migration avance malgré eux.
 */
export async function migrateCloudinaryBatch(
  db: PrismaClient,
  appRoot: string,
  max = 6,
  exclude: string[] = [],
): Promise<{ items: MigrationItem[]; status: MigrationStatus }> {
  const items: MigrationItem[] = [];
  const excludedAssets = exclude.filter((x) => !x.startsWith("user:"));
  const excludedUsers = new Set(exclude.filter((x) => x.startsWith("user:")).map((x) => x.slice(5)));
  const assets = await db.mediaAsset.findMany({
    where: { publicId: { not: null }, status: { not: "bin" }, ...(excludedAssets.length ? { id: { notIn: excludedAssets } } : {}) },
    select: { id: true, publicId: true, fullPath: true, format: true, mimeType: true, originalFileName: true, displayName: true },
    orderBy: { createdAt: "asc" },
    take: max,
  });

  for (const a of assets) {
    const name = a.displayName ?? a.originalFileName;
    try {
      const publicId = a.publicId!;
      const ext = a.format ?? EXT_BY_MIME[a.mimeType] ?? "bin";
      let key = hasExtension(a.fullPath) ? a.fullPath : `${publicId}.${ext}`;
      // Un autre fichier (déjà sur R2) occupe ce chemin : suffixe pour ne rien écraser.
      const clash = await db.mediaAsset.findFirst({ where: { fullPath: key, NOT: { id: a.id } }, select: { id: true } });
      if (clash) key = key.replace(/(\.[^./]+)$/, "-cloudinary$1");

      let bytes = await r2Has(key);
      if (bytes === null || bytes === 0) {
        const file = await download(publicId, a.format);
        await upload(key, file.body, a.mimeType || file.contentType);
        bytes = file.body.length;
      }
      await db.mediaAsset.update({
        where: { id: a.id },
        data: {
          legacyCloudinaryPublicId: publicId,
          publicId: null,
          secureUrl: null,
          resourceType: null,
          cloudinaryAssetId: null,
          fullPath: key,
          bytes,
        },
      });
      items.push({ id: a.id, kind: "file", name, ok: true });
    } catch (err) {
      items.push({ id: a.id, kind: "file", name, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  // Avatars : une fois les fichiers terminés (lots indépendants).
  if (assets.length < max) {
    const users = await db.user.findMany({ where: { avatar: { not: null } }, select: { id: true, avatar: true, firstName: true, lastName: true, email: true } });
    const pending = users.filter((u) => u.avatar && !isR2AvatarKey(u.avatar) && !excludedUsers.has(u.id)).slice(0, max - assets.length);
    for (const u of pending) {
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
      try {
        const file = await download(u.avatar!, null);
        const ext = EXT_BY_MIME[file.contentType] ?? "jpg";
        if (!["jpg", "png", "webp"].includes(ext)) throw new Error(`format d'avatar inattendu (${file.contentType})`);
        const key = `${appRoot}/avatars/${u.id}/${Date.now()}-cloudinary.${ext}`;
        await upload(key, file.body, file.contentType);
        await db.user.update({ where: { id: u.id }, data: { avatar: key } });
        items.push({ id: `user:${u.id}`, kind: "avatar", name, ok: true });
      } catch (err) {
        items.push({ id: `user:${u.id}`, kind: "avatar", name, ok: false, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }

  return { items, status: await cloudinaryMigrationStatus(db) };
}
