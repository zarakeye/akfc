#!/usr/bin/env bash
#
# AKFC — Sandbox, PHASE 3 : backend média LOCAL (MinIO + imgproxy).
#
#   1. backends/minioClient.ts : client S3 dédié MinIO (forcePathStyle) + bucket,
#      env lues paresseusement (rien ne casse quand le driver est cloudinary).
#   2. backends/localBackend.ts: implémente `MediaBackend` :
#        - buildAuthenticatedUrl → URL imgproxy SIGNÉE (variantes rs:… validées) ;
#        - fetchAuthenticatedAsset → fetch de cette URL ;
#        - getAssetInfo → HeadObject (bytes, date, format via ContentType) ;
#        - fileExists → HeadObject ;
#        - listAuthenticatedResources → ListObjectsV2 (+ Head pour le format) ;
#        - deleteByPrefix → ListObjects + DeleteObjects ;
#        - deleteCloudinaryFolderRecursive → no-op (S3 n'a pas de dossiers vides) ;
#        - video poster → frame imgproxy (nécessite les video thumbnails).
#      Clés S3 = publicId extensionless (comme Cloudinary) → buildAuthenticatedUrl
#      reste synchrone.
#   3. façade : la branche `local` pointe enfin `localBackend`.
#
# Défaut = cloudinary → ZÉRO changement en prod. localBackend doit juste COMPILER
# et satisfaire MediaBackend (garanti par le typecheck). L'env (MEDIA_S3_*,
# IMGPROXY_*) sera câblée dans le compose sandbox en Phase 5.
#
# Backend seul, typecheck backend + web.
#
# Usage : bash sandbox-phase3-localbackend.sh
#         AKFC_APPLY_ONLY=1 bash sandbox-phase3-localbackend.sh   (clone)
#
set -euo pipefail

DIR="packages/backend/src/modules/cloudinary/backends"
FACADE="packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"
MINIO="$DIR/minioClient.ts"
LOCAL="$DIR/localBackend.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -d "$DIR" ]    || { echo "ERREUR: $DIR introuvable — applique 2a/2b d'abord." >&2; exit 1; }
[ -f "$FACADE" ] || { echo "ERREUR: $FACADE introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Client MinIO ──────────────────────────────────────────────────────────
cat > "$MINIO" <<'TS'
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Client S3 dédié au stockage média local (MinIO), pour la sandbox.
 *
 * Distinct du client R2 : MinIO exige `forcePathStyle: true` (URLs
 * `endpoint/bucket/key`), là où R2 accepte le virtual-host style. On garde donc
 * un client séparé pour ne pas altérer R2 en prod.
 *
 * Env lues paresseusement : tant que `STORAGE_DRIVER !== "local"`, ce module est
 * importé mais ses fonctions ne sont jamais appelées → aucune var requise en prod.
 */

let cached: S3Client | null = null;

function readEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Média local (MinIO) : env var manquante ${name}. Attendu : ` +
        `MEDIA_S3_ENDPOINT, MEDIA_S3_ACCESS_KEY_ID, MEDIA_S3_SECRET_ACCESS_KEY, MEDIA_S3_BUCKET.`,
    );
  }
  return v;
}

export function getMediaS3Client(): S3Client {
  if (cached) return cached;
  cached = new S3Client({
    region: "us-east-1",
    endpoint: readEnv("MEDIA_S3_ENDPOINT"),
    forcePathStyle: true,
    credentials: {
      accessKeyId: readEnv("MEDIA_S3_ACCESS_KEY_ID"),
      secretAccessKey: readEnv("MEDIA_S3_SECRET_ACCESS_KEY"),
    },
  });
  return cached;
}

export function getMediaBucket(): string {
  return readEnv("MEDIA_S3_BUCKET");
}
TS
echo "créé  $MINIO"

# ── 2. localBackend ──────────────────────────────────────────────────────────
cat > "$LOCAL" <<'TS'
import crypto from "crypto";

import {
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

import {
  getMediaS3Client,
  getMediaBucket,
} from "@backend/modules/cloudinary/backends/minioClient";
import type {
  MediaBackend,
  Variant,
  GetAssetInfoResult,
  ListAuthenticatedResourcesResult,
} from "@backend/modules/cloudinary/backends/media.types";

/**
 * Backend média LOCAL : MinIO (stockage S3) + imgproxy (transformations par URL).
 * Réplique le modèle Cloudinary self-hosted pour la sandbox.
 *
 * Clés S3 = publicId (extensionless), comme Cloudinary → `buildAuthenticatedUrl`
 * reste synchrone. Le `format` est déduit du `ContentType` de l'objet.
 */

/* ── imgproxy ────────────────────────────────────────────────────────────── */

function imgproxyConf(): { base: string; key: string; salt: string } {
  const base = process.env.IMGPROXY_URL;
  const key = process.env.IMGPROXY_KEY;
  const salt = process.env.IMGPROXY_SALT;
  if (!base || !key || !salt) {
    throw new Error(
      "Média local : env imgproxy manquante (IMGPROXY_URL, IMGPROXY_KEY, IMGPROXY_SALT).",
    );
  }
  return { base: base.replace(/\/+$/, ""), key, salt };
}

// Variantes → options de traitement imgproxy (mêmes tailles que Cloudinary).
const RESIZE: Record<Variant, string> = {
  thumb: "rs:fill:150:150",
  small: "rs:fit:300:0",
  medium: "rs:fit:600:0",
  large: "rs:fit:1200:0",
  original: "",
};

/** Signature imgproxy : base64url( HMAC-SHA256(hex(key), hex(salt) + path) ). */
function signPath(path: string): string {
  const { key, salt } = imgproxyConf();
  const hmac = crypto.createHmac("sha256", Buffer.from(key, "hex"));
  hmac.update(Buffer.from(salt, "hex"));
  hmac.update(path);
  return hmac.digest("base64url");
}

function imgproxyUrl(publicId: string, variant: Variant): string {
  const { base } = imgproxyConf();
  const bucket = getMediaBucket();
  const opts = RESIZE[variant];
  const source = `plain/s3://${bucket}/${publicId}`;
  const path = opts ? `/${opts}/${source}` : `/${source}`;
  return `${base}/${signPath(path)}${path}`;
}

/* ── format / resource_type depuis le ContentType ─────────────────────────── */

function formatFromContentType(ct?: string): string | undefined {
  if (!ct) return undefined;
  const sub = ct.split("/")[1]?.split(";")[0];
  if (!sub) return undefined;
  return sub === "jpeg" ? "jpg" : sub;
}

function resourceTypeFromContentType(ct?: string): "image" | "video" | "raw" {
  if (ct?.startsWith("image/")) return "image";
  if (ct?.startsWith("video/")) return "video";
  return "raw";
}

/* ── implémentation ───────────────────────────────────────────────────────── */

function buildAuthenticatedUrl(publicId: string, variant: Variant): string {
  return imgproxyUrl(publicId, variant);
}

async function fetchAuthenticatedAsset(
  publicId: string,
  variant: Variant,
): Promise<Response | null> {
  try {
    const res = await fetch(imgproxyUrl(publicId, variant), { cache: "no-store" });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

async function getAssetInfo(publicId: string): Promise<GetAssetInfoResult> {
  const s3 = getMediaS3Client();
  const head = await s3.send(
    new HeadObjectCommand({ Bucket: getMediaBucket(), Key: publicId }),
  );
  const ct = head.ContentType ?? undefined;
  return {
    resource_type: resourceTypeFromContentType(ct),
    bytes: head.ContentLength,
    created_at: head.LastModified?.toISOString(),
    asset_id: head.ETag?.replace(/"/g, ""),
    format: formatFromContentType(ct),
  };
}

async function fileExists(publicId: string): Promise<boolean> {
  try {
    await getMediaS3Client().send(
      new HeadObjectCommand({ Bucket: getMediaBucket(), Key: publicId }),
    );
    return true;
  } catch {
    return false;
  }
}

async function listAuthenticatedResources(
  prefix: string,
): Promise<ListAuthenticatedResourcesResult[]> {
  const s3 = getMediaS3Client();
  const Bucket = getMediaBucket();
  const out = await s3.send(
    new ListObjectsV2Command({ Bucket, Prefix: prefix, MaxKeys: 1000 }),
  );
  const objects = out.Contents ?? [];
  // N+1 Head pour le ContentType → format. Acceptable à l'échelle sandbox.
  return Promise.all(
    objects
      .filter((o): o is typeof o & { Key: string } => Boolean(o.Key))
      .map(async (o) => {
        let format: string | undefined;
        try {
          const h = await s3.send(new HeadObjectCommand({ Bucket, Key: o.Key }));
          format = formatFromContentType(h.ContentType);
        } catch {
          /* format inconnu : on laisse undefined */
        }
        return {
          publicId: o.Key,
          url: imgproxyUrl(o.Key, "original"),
          format,
        };
      }),
  );
}

async function deleteByPrefix(prefix: string): Promise<{ success: boolean }> {
  const s3 = getMediaS3Client();
  const Bucket = getMediaBucket();
  let ContinuationToken: string | undefined;
  do {
    const out = await s3.send(
      new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken }),
    );
    const keys = (out.Contents ?? [])
      .filter((o): o is typeof o & { Key: string } => Boolean(o.Key))
      .map((o) => ({ Key: o.Key }));
    if (keys.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({ Bucket, Delete: { Objects: keys } }),
      );
    }
    ContinuationToken = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return { success: true };
}

// S3 n'a pas de dossiers vides à supprimer (préfixes seulement) → no-op.
async function deleteCloudinaryFolderRecursive(_prefix: string): Promise<void> {
  return;
}

// Poster vidéo : imgproxy extrait une frame si les video thumbnails sont activés.
function buildVideoPosterUrl(publicId: string, variant: Variant = "large"): string {
  return imgproxyUrl(publicId, variant);
}

async function fetchVideoPoster(
  publicId: string,
  variant: Variant,
): Promise<Response | null> {
  try {
    const res = await fetch(buildVideoPosterUrl(publicId, variant), {
      cache: "no-store",
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

export const localBackend: MediaBackend = {
  buildAuthenticatedUrl,
  fetchAuthenticatedAsset,
  getAssetInfo,
  fileExists,
  listAuthenticatedResources,
  deleteByPrefix,
  deleteCloudinaryFolderRecursive,
  buildVideoPosterUrl,
  fetchVideoPoster,
};
TS
echo "créé  $LOCAL"

# ── 3. Façade : brancher la branche `local` ─────────────────────────────────
python3 - "$FACADE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

imp_old = 'import { cloudinaryBackend } from "@backend/modules/cloudinary/backends/cloudinaryBackend";\n'
assert imp_old in s, "ancre import cloudinaryBackend (façade) introuvable"
if "localBackend" not in s:
    s = s.replace(
        imp_old,
        imp_old
        + 'import { localBackend } from "@backend/modules/cloudinary/backends/localBackend";\n',
    )

sel_old = (
    "const backend: MediaBackend =\n"
    '  process.env.STORAGE_DRIVER === "local"\n'
    "    ? cloudinaryBackend // TODO Phase 3 : localBackend (MinIO + imgproxy)\n"
    "    : cloudinaryBackend;\n"
)
sel_new = (
    "const backend: MediaBackend =\n"
    '  process.env.STORAGE_DRIVER === "local" ? localBackend : cloudinaryBackend;\n'
)
assert sel_old in s, "ancre sélecteur (façade) introuvable"
s = s.replace(sel_old, sel_new)

p.write_text(s, encoding="utf-8")
print("façade : branche local → localBackend")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(media): phase 3 — backend local MinIO+imgproxy (implémente MediaBackend)" \
  && echo "commit $(git rev-parse --short HEAD)"