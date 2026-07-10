import { TRPCError } from "@trpc/server";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";

/**
 * readUploadedAssetMetadata.service.ts
 *
 * Relit les métadonnées d'un asset fraîchement uploadé directement depuis
 * Cloudinary (source de vérité), plutôt que de faire confiance au payload
 * envoyé par le client.
 *
 * ─── mimeType : dérivé de Cloudinary, jamais du client ──────────────────────
 *
 * Cloudinary ne renvoie pas un mimeType complet, mais il renvoie le couple
 * fiable `resource_type` (image | video) + `format` (jpg, mp4, mp3…). On en
 * dérive un mimeType correct. C'est ce qui empêche les lignes aberrantes du
 * type `image/mp4` (un .mp4 dont le client avait déclaré `mimeType: image/...`).
 *
 * Note : Cloudinary range l'AUDIO sous `resource_type: "video"`. On
 * désambiguïse par le `format` (mp3/wav/… → audio/*).
 */

/* -------------------------------------------------------------------------- */
/*                          DÉRIVATION DU MIME TYPE                           */
/* -------------------------------------------------------------------------- */

const AUDIO_MIME_BY_FORMAT: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  flac: "audio/flac",
  weba: "audio/webm",
};

const VIDEO_MIME_BY_FORMAT: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  m4v: "video/x-m4v",
  ogv: "video/ogg",
};

const IMAGE_MIME_BY_FORMAT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  tiff: "image/tiff",
  ico: "image/x-icon",
  heic: "image/heic",
  heif: "image/heif",
};

/**
 * Dérive un mimeType depuis le couple (resourceType, format) Cloudinary.
 * Toujours préférable au mimeType déclaré par le client, qui peut mentir.
 */
function deriveMimeType(
  resourceType: "image" | "video",
  format: string | null,
): string {
  const fmt = (format ?? "").toLowerCase();

  if (resourceType === "video") {
    // Cloudinary range l'audio sous "video" → on teste d'abord les formats
    // audio connus, sinon on retombe sur de la vraie vidéo.
    if (fmt in AUDIO_MIME_BY_FORMAT) return AUDIO_MIME_BY_FORMAT[fmt];
    return VIDEO_MIME_BY_FORMAT[fmt] ?? "video/mp4";
  }

  return IMAGE_MIME_BY_FORMAT[fmt] ?? `image/${fmt || "octet-stream"}`;
}

/* -------------------------------------------------------------------------- */
/*                                  SERVICE                                   */
/* -------------------------------------------------------------------------- */

export async function readUploadedAssetMetadata(params: {
  publicId: string;
  resourceType: "image" | "video";
}) {
  const { publicId, resourceType } = params;

  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type: "authenticated",
    });

    const format = (result.format as string | undefined) ?? null;

    return {
      publicId: result.public_id as string,
      assetId: (result.asset_id as string | undefined) ?? null,
      secureUrl: result.secure_url as string,
      resourceType,
      format,
      // mimeType dérivé de Cloudinary (resourceType + format), JAMAIS du client.
      mimeType: deriveMimeType(resourceType, format),
      bytes: (result.bytes as number | undefined) ?? 0,
      width: (result.width as number | undefined) ?? null,
      height: (result.height as number | undefined) ?? null,
      duration: (result.duration as number | undefined) ?? null,
      version: (result.version as number | undefined) ?? null,
    };
  } catch {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Uploaded asset not found on Cloudinary.",
    });
  }
}
