import { createHash } from "node:crypto";
import { spawn } from "node:child_process";

import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

import { getR2Bucket, getR2Client } from "@backend/modules/storage/adapters/r2/client";

/*
 * Déclinaisons des médias stockés sur R2 (remplace les transformations de Cloudinary) :
 *   - images : largeurs thumb (150×150 recadré), small (300), medium (600), large (1 200), en WebP ;
 *   - vidéos : image d'affiche (première seconde) extraite par ffmpeg, aux mêmes largeurs, en JPEG.
 * Fabriquées à la PREMIÈRE demande, puis rangées dans R2 sous `_derived/` (hors de la racine de
 * l'application : jamais listées par le finder) et servies comme n'importe quel objet.
 *
 * Clé : `_derived/<empreinte du chemin>/<ETag de l'original>-<déclinaison>.<ext>`. L'ETag change
 * quand le fichier est remplacé (avatar réécrit, recadrage) : la déclinaison se refait d'elle-même.
 * deleteDerivatives(chemin) efface tout le dossier d'un fichier (corbeille vidée, purge).
 */

export type MediaVariant = "thumb" | "small" | "medium" | "large" | "original";

export function parseMediaVariant(value: string | null | undefined): MediaVariant | null {
  return value === "thumb" || value === "small" || value === "medium" || value === "large" || value === "original" ? value : null;
}

const SIZES: Record<Exclude<MediaVariant, "original">, { width: number; height?: number }> = {
  thumb: { width: 150, height: 150 },
  small: { width: 300 },
  medium: { width: 600 },
  large: { width: 1200 },
};

export const DERIVED_ROOT = "_derived/";
/** Au-delà, on sert l'original plutôt que de charger le serveur. */
const MAX_SOURCE_BYTES = 60 * 1024 * 1024;
const FFMPEG_TIMEOUT_MS = 30_000;

const ext = (path: string): string => path.slice(path.lastIndexOf(".") + 1).toLowerCase();
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "avif", "heic", "heif", "tif", "tiff", "bmp"]);
const VIDEO_EXT = new Set(["mp4", "mov", "m4v", "webm", "mkv", "avi", "ogv", "3gp"]);

/** Image raster déclinable (SVG et GIF animés sont toujours servis tels quels). */
export const isTransformableImage = (path: string): boolean => IMAGE_EXT.has(ext(path));
export const isVideo = (path: string): boolean => VIDEO_EXT.has(ext(path));

export function derivedFolder(fullPath: string): string {
  return `${DERIVED_ROOT}${createHash("sha1").update(fullPath).digest("hex")}/`;
}

async function originalEtag(fullPath: string): Promise<{ etag: string; bytes: number } | null> {
  try {
    const head = await getR2Client().send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: fullPath }));
    const etag = (head.ETag ?? "").replace(/"/g, "").replace(/[^A-Za-z0-9-]/g, "");
    return { etag: etag || "x", bytes: head.ContentLength ?? 0 };
  } catch {
    return null;
  }
}

async function exists(key: string): Promise<boolean> {
  try {
    await getR2Client().send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function put(key: string, body: Buffer, contentType: string): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

function resize(input: Buffer, variant: Exclude<MediaVariant, "original">): sharp.Sharp {
  const s = SIZES[variant];
  // rotate() applique l'orientation EXIF (photos de téléphone) ; les métadonnées (GPS…) ne sont pas recopiées.
  return sharp(input, { failOn: "none" })
    .rotate()
    .resize(s.height ? { width: s.width, height: s.height, fit: "cover" } : { width: s.width, withoutEnlargement: true });
}

/** Clé R2 de la déclinaison d'une image (fabriquée au besoin), ou null : servir l'original. */
export async function ensureImageVariant(fullPath: string, variant: MediaVariant): Promise<string | null> {
  if (variant === "original" || !isTransformableImage(fullPath)) return null;
  const src = await originalEtag(fullPath);
  if (!src || src.bytes > MAX_SOURCE_BYTES) return null;
  const key = `${derivedFolder(fullPath)}${src.etag}-${variant}.webp`;
  if (await exists(key)) return key;

  const obj = await getR2Client().send(new GetObjectCommand({ Bucket: getR2Bucket(), Key: fullPath }));
  if (!obj.Body) return null;
  const input = Buffer.from(await obj.Body.transformToByteArray());
  const out = await resize(input, variant).webp({ quality: 80 }).toBuffer();
  await put(key, out, "image/webp");
  return key;
}

let ffmpegMissing = false;

function grabFrame(url: string, seconds: number): Promise<Buffer | null> {
  return new Promise((resolve) => {
    let proc;
    try {
      proc = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(seconds), "-i", url, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], {
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      ffmpegMissing = true;
      resolve(null);
      return;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    const timer = setTimeout(() => proc.kill("SIGKILL"), FFMPEG_TIMEOUT_MS);
    proc.stdout.on("data", (c: Buffer) => {
      size += c.length;
      if (size <= 30 * 1024 * 1024) chunks.push(c);
    });
    proc.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ENOENT") ffmpegMissing = true;
      clearTimeout(timer);
      resolve(null);
    });
    proc.on("close", () => {
      clearTimeout(timer);
      resolve(size > 0 ? Buffer.concat(chunks) : null);
    });
  });
}

/** Clé R2 de l'affiche d'une vidéo (fabriquée au besoin), ou null (ffmpeg absent, vidéo illisible). */
export async function ensureVideoPoster(fullPath: string, variant: MediaVariant): Promise<string | null> {
  if (!isVideo(fullPath) || ffmpegMissing) return null;
  const v: Exclude<MediaVariant, "original"> = variant === "original" ? "large" : variant;
  const src = await originalEtag(fullPath);
  if (!src) return null;
  const key = `${derivedFolder(fullPath)}${src.etag}-poster-${v}.jpg`;
  if (await exists(key)) return key;

  const url = await getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: getR2Bucket(), Key: fullPath }), { expiresIn: 600 });
  const frame = (await grabFrame(url, 1)) ?? (await grabFrame(url, 0));
  if (!frame) {
    if (ffmpegMissing) console.error("[media/derivatives] ffmpeg introuvable : affiches de vidéo indisponibles");
    return null;
  }
  const out = await resize(frame, v).jpeg({ quality: 82 }).toBuffer();
  await put(key, out, "image/jpeg");
  return key;
}

/** Efface toutes les déclinaisons d'un fichier (après suppression définitive ou déplacement). */
export async function deleteDerivatives(fullPath: string): Promise<number> {
  const s3 = getR2Client();
  const Bucket = getR2Bucket();
  let deleted = 0;
  let token: string | undefined;
  do {
    const list = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: derivedFolder(fullPath), ContinuationToken: token }));
    const keys = (list.Contents ?? []).map((o) => o.Key).filter((k): k is string => Boolean(k));
    if (keys.length > 0) {
      await s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: keys.map((Key) => ({ Key })) } }));
      deleted += keys.length;
    }
    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);
  return deleted;
}

/**
 * Pour une route de livraison R2 : la clé à servir selon `variant` et `as=poster`.
 * Sans paramètre : l'original (comportement historique, documents compris).
 * Renvoie null si une affiche est demandée mais impossible à produire (la route répond 404).
 */
export async function resolveDeliveryKey(fullPath: string, params: URLSearchParams): Promise<string | null> {
  const variant = parseMediaVariant(params.get("variant"));
  if (params.get("as") === "poster") return ensureVideoPoster(fullPath, variant ?? "large");
  if (!variant) return fullPath;
  try {
    return (await ensureImageVariant(fullPath, variant)) ?? fullPath;
  } catch (err) {
    console.error("[media/derivatives] déclinaison impossible, original servi :", fullPath, err instanceof Error ? err.message : err);
    return fullPath;
  }
}

/* ── Dimensions à l'enregistrement d'un envoi (meilleur effort, jamais bloquant) ── */

export type MediaDimensions = { width?: number; height?: number; duration?: number };

function runJson(cmd: string, args: string[]): Promise<unknown> {
  return new Promise((resolve) => {
    let out = "";
    let proc: ReturnType<typeof spawn>;
    try {
      proc = spawn(cmd, args, { stdio: ["ignore", "pipe", "ignore"] });
    } catch {
      resolve(null);
      return;
    }
    const timer = setTimeout(() => proc.kill("SIGKILL"), FFMPEG_TIMEOUT_MS);
    proc.stdout?.on("data", (c: Buffer) => {
      if (out.length < 200_000) out += c.toString("utf8");
    });
    proc.on("error", () => {
      clearTimeout(timer);
      resolve(null);
    });
    proc.on("close", () => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(out));
      } catch {
        resolve(null);
      }
    });
  });
}

/** Largeur, hauteur (images, vidéos) et durée (vidéos) d'un objet R2, ou null. */
export async function probeMediaDimensions(fullPath: string, mimeType: string): Promise<MediaDimensions | null> {
  try {
    if (mimeType.startsWith("image/") && isTransformableImage(fullPath)) {
      const obj = await getR2Client().send(new GetObjectCommand({ Bucket: getR2Bucket(), Key: fullPath }));
      if (!obj.Body) return null;
      const meta = await sharp(Buffer.from(await obj.Body.transformToByteArray()), { failOn: "none" }).metadata();
      if (!meta.width || !meta.height) return null;
      // Orientation EXIF 5 à 8 : photo tournée d'un quart de tour, largeur et hauteur s'échangent.
      const rotated = (meta.orientation ?? 1) >= 5;
      return rotated ? { width: meta.height, height: meta.width } : { width: meta.width, height: meta.height };
    }
    if (mimeType.startsWith("video/")) {
      const url = await getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: getR2Bucket(), Key: fullPath }), { expiresIn: 600 });
      const json = (await runJson("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", url])) as {
        streams?: Array<{ width?: number; height?: number }>;
        format?: { duration?: string };
      } | null;
      if (!json) return null;
      const s = json.streams?.[0];
      const duration = json.format?.duration ? Number(json.format.duration) : undefined;
      return { width: s?.width, height: s?.height, duration: duration && Number.isFinite(duration) ? duration : undefined };
    }
  } catch (err) {
    console.error("[media/derivatives] dimensions illisibles :", fullPath, err instanceof Error ? err.message : err);
  }
  return null;
}

/**
 * Sert une DÉCLINAISON (vignette, affiche) en flux, avec un cache navigateur : une URL de proxy
 * stable (chemin + déclinaison) se met ainsi en cache, contrairement à une redirection vers une URL
 * signée qui change à chaque requête. L'original (vidéos : requêtes partielles) reste en redirection.
 */
export async function streamDerived(key: string, cacheControl: string): Promise<Response> {
  const obj = await getR2Client().send(new GetObjectCommand({ Bucket: getR2Bucket(), Key: key }));
  if (!obj.Body) return new Response("Not found", { status: 404 });
  return new Response(obj.Body.transformToWebStream(), {
    status: 200,
    headers: {
      "Content-Type": obj.ContentType ?? "application/octet-stream",
      ...(obj.ContentLength != null ? { "Content-Length": String(obj.ContentLength) } : {}),
      "Cache-Control": cacheControl,
    },
  });
}
