#!/usr/bin/env bash
#
# AKFC — Chantier corbeille R2-aware — INCRÉMENT 1/5 : primitives R2.
#
# Crée packages/backend/src/modules/trash/services/r2TrashOps.ts : les
# équivalents R2 (S3) des opérations physiques de la corbeille (exists,
# getInfo, moveFile, moveFolder, deleteFile, deleteByPrefix, listByPrefix).
# PUREMENT ADDITIF : aucun service existant n'est modifié → aucun changement
# de comportement. Fondation des incréments 2-5.
#
# Usage : bash apply-trash-r2-1-primitives.sh
#         AKFC_APPLY_ONLY=1 bash apply-trash-r2-1-primitives.sh   (clone)
#
set -euo pipefail
DEST="packages/backend/src/modules/trash/services/r2TrashOps.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -d "packages/backend/src/modules/trash/services" ] || { echo "ERREUR: dossier trash/services introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

cat > "$DEST" <<'TS'
/**
 * r2TrashOps — primitives R2 (S3) pour la couche corbeille.
 *
 * ─── Pourquoi ce module ───────────────────────────────────────────────────
 *
 * Historiquement, tous les services de la corbeille (trashToBin, restore,
 * purge, deleteForever, readTrashFolder) parlent à Cloudinary EN DIRECT. Les
 * assets stockés sur R2 (typiquement les PDF) étaient donc créables mais PAS
 * jetables : `getAssetInfo`/`rename`/`destroy` Cloudinary ne les connaissent
 * pas et lèvent « Asset not found (any resource_type) ».
 *
 * Ce module fournit les équivalents R2 des opérations physiques dont la
 * corbeille a besoin. Il est volontairement AUTONOME (bâti sur getR2Client /
 * getR2Bucket, déjà exportés) pour ne pas modifier `r2StorageAdapter` dont les
 * helpers de move/delete sont privés.
 *
 * ─── Rappels R2/S3 ────────────────────────────────────────────────────────
 *
 *   - S3 n'a pas de « rename » : un move = CopyObject + DeleteObject.
 *   - La clé R2 d'un asset = son `fullPath` TEL QUEL, extension comprise
 *     (contrairement à Cloudinary où le public_id n'a pas d'extension).
 *   - HeadObject sert d'oracle d'existence (+ taille / date).
 */

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  type S3Client,
} from "@aws-sdk/client-s3";

import {
  getR2Client,
  getR2Bucket,
} from "@backend/modules/storage/adapters/r2/client";

/** True si l'erreur S3 est un 404 / NoSuchKey / NotFound. */
function isNotFound(err: unknown): boolean {
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
  return (
    e?.name === "NotFound" ||
    e?.name === "NoSuchKey" ||
    e?.$metadata?.httpStatusCode === 404
  );
}

/** CopySource doit être URL-encodé (bucket/clé), les espaces/accents compris. */
function buildCopySource(bucket: string, key: string): string {
  return `${bucket}/${key}`
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/** Existe-t-il un objet R2 à cette clé exacte ? (sans throw) */
export async function r2Exists(key: string): Promise<boolean> {
  const s3: S3Client = getR2Client();
  const Bucket = getR2Bucket();
  try {
    await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
    return true;
  } catch (err) {
    if (isNotFound(err)) return false;
    throw err;
  }
}

/** Métadonnées d'un objet R2 (taille + date), ou null si absent. */
export async function r2GetInfo(
  key: string,
): Promise<{ bytes?: number; createdAt?: Date } | null> {
  const s3: S3Client = getR2Client();
  const Bucket = getR2Bucket();
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
    return {
      bytes: head.ContentLength,
      createdAt: head.LastModified ? new Date(head.LastModified) : undefined,
    };
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

/** Déplace un objet R2 (copy + delete). srcKey/dstKey = fullPath exacts. */
export async function r2MoveFile(srcKey: string, dstKey: string): Promise<void> {
  const s3: S3Client = getR2Client();
  const Bucket = getR2Bucket();
  await s3.send(
    new CopyObjectCommand({
      Bucket,
      Key: dstKey,
      CopySource: buildCopySource(Bucket, srcKey),
    }),
  );
  await s3.send(new DeleteObjectCommand({ Bucket, Key: srcKey }));
}

/** Liste (paginée) les clés R2 sous un préfixe. */
export async function r2ListByPrefix(
  prefix: string,
): Promise<Array<{ key: string; bytes?: number; createdAt?: Date }>> {
  const s3: S3Client = getR2Client();
  const Bucket = getR2Bucket();
  const out: Array<{ key: string; bytes?: number; createdAt?: Date }> = [];
  let ContinuationToken: string | undefined;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix: prefix,
        ContinuationToken,
        MaxKeys: 1000,
      }),
    );
    for (const o of res.Contents ?? []) {
      if (!o.Key) continue;
      out.push({
        key: o.Key,
        bytes: o.Size,
        createdAt: o.LastModified ? new Date(o.LastModified) : undefined,
      });
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return out;
}

/** Déplace récursivement tout ce qui vit sous srcPrefix vers dstPrefix. */
export async function r2MoveFolder(
  srcPrefix: string,
  dstPrefix: string,
): Promise<void> {
  const src = srcPrefix.endsWith("/") ? srcPrefix : `${srcPrefix}/`;
  const dst = dstPrefix.endsWith("/") ? dstPrefix : `${dstPrefix}/`;
  const objects = await r2ListByPrefix(src);
  for (const obj of objects) {
    const relative = obj.key.slice(src.length);
    await r2MoveFile(obj.key, dst + relative);
  }
}

/** Supprime un objet R2 (idempotent : un 404 n'est pas une erreur). */
export async function r2DeleteFile(key: string): Promise<void> {
  const s3: S3Client = getR2Client();
  const Bucket = getR2Bucket();
  try {
    await s3.send(new DeleteObjectCommand({ Bucket, Key: key }));
  } catch (err) {
    if (!isNotFound(err)) throw err;
  }
}

/** Supprime tout ce qui vit sous un préfixe R2 (par lots de 1000). */
export async function r2DeleteByPrefix(prefix: string): Promise<void> {
  const s3: S3Client = getR2Client();
  const Bucket = getR2Bucket();
  const pfx = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const objects = await r2ListByPrefix(pfx);
  for (let i = 0; i < objects.length; i += 1000) {
    const batch = objects.slice(i, i + 1000);
    if (batch.length === 0) continue;
    await s3.send(
      new DeleteObjectsCommand({
        Bucket,
        Delete: { Objects: batch.map((o) => ({ Key: o.key })) },
      }),
    );
  }
}
TS
echo "créé : $DEST"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(trash): primitives R2 pour la corbeille (incrément 1/5, additif)" && echo "commit $(git rev-parse --short HEAD)"