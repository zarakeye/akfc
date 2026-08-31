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
