#!/bin/bash
# Fix "un cliche de retard" sur l avatar. Cause : le publicId est FIXE ; a
# l ecrasement, le CDN Cloudinary garde l ANCIEN binaire pour la meme URL
# (buildAuthenticatedUrl ne passait pas de version). L affichage servait donc
# l avant-dernier cliche. Fix de bout en bout : la version Cloudinary du
# binaire (result.version) remonte de readUploadedAssetMetadata -> register
# -> store -> URL ?v= -> route -> cloudinary.url({version}). L URL pointe
# alors vers le bon binaire, le CDN sert le bon fichier immediatement.
# À lancer depuis la RACINE du monorepo : bash fix_avatar_cloudinary_version.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> packages/backend/src/modules/cloudinary/services/readUploadedAssetMetadata.service.ts"
cat > 'packages/backend/src/modules/cloudinary/services/readUploadedAssetMetadata.service.ts' << 'FILE_EOF'
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
FILE_EOF

echo "-> packages/backend/src/modules/avatar/avatar.service.ts"
cat > 'packages/backend/src/modules/avatar/avatar.service.ts' << 'FILE_EOF'
import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { readUploadedAssetMetadata } from "@backend/modules/cloudinary/services/readUploadedAssetMetadata.service";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";

/**
 * avatar.service.ts — pipeline avatar, ISOLÉ du reste.
 *
 * Un avatar n'est PAS un MediaAsset de bibliothèque : pas de catégorie,
 * pas de cycle pending/published, pas de présence dans le finder. On ne
 * stocke donc QUE son publicId sur `User.avatar` ; l'URL est construite à
 * la volée par le proxy `by-public-id` (délivrance publique, comme tout
 * asset authenticated).
 *
 * Un seul fichier remplaçable, sous `${appRoot}/avatars/${userId}/avatar`
 * (publicId fixe → le ré-upload écrase). Le folder et le publicId sont
 * dérivés du userId côté serveur : un user ne peut ni écrire ni deviner
 * l'avatar d'un autre.
 */

/** Dossier-entité de l'avatar d'un user. */
export function avatarFolder(appRoot: string, userId: string): string {
  return `${appRoot}/avatars/${userId}`;
}

/** publicId complet, fixe (un seul avatar par user). */
export function avatarPublicId(appRoot: string, userId: string): string {
  return `${avatarFolder(appRoot, userId)}/avatar`;
}

/**
 * Signature d'un upload direct d'avatar (authenticated, overwrite forcé —
 * on écrase toujours l'avatar précédent au même publicId). Ne passe PAS
 * par resolvePendingUploadFolder : le folder est l'espace privé du user.
 */
export function createAvatarUploadSignature(params: {
  appRoot: string;
  userId: string;
}) {
  const { appRoot, userId } = params;
  const folder = avatarFolder(appRoot, userId);
  const publicId = "avatar";
  const timestamp = Math.floor(Date.now() / 1000);

  const toSign: Record<string, string | number | boolean> = {
    folder,
    overwrite: true,
    public_id: publicId,
    timestamp,
    type: "authenticated",
  };
  const signature = crypto
    .createHash("sha1")
    .update(
      Object.keys(toSign)
        .sort()
        .map((k) => `${k}=${toSign[k]}`)
        .join("&") + process.env.CLOUDINARY_API_SECRET,
    )
    .digest("hex");

  return {
    folder,
    publicId,
    fullPublicId: `${folder}/${publicId}`,
    timestamp,
    overwrite: true,
    type: "authenticated" as const,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}

/**
 * Après upload Cloudinary : relit les métadonnées (source de vérité, pour
 * confirmer que le fichier existe bien), puis pointe `User.avatar` sur le
 * publicId. Aucune ligne MediaAsset créée.
 */
export async function registerAvatar(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<{ publicId: string; version: number | null }> {
  const { prisma, appRoot, userId } = params;
  const fullPublicId = avatarPublicId(appRoot, userId);

  // Relit les métadonnées Cloudinary : confirme l'upload ET récupère la
  // `version` (numéro Cloudinary). Cette version, injectée dans l'URL de
  // l'avatar (`?v=`), garantit que le CDN sert le BON binaire immédiatement
  // (sinon l'ancien, encore en cache CDN, s'affichait → « un cliché de
  // retard »).
  const meta = await readUploadedAssetMetadata({
    publicId: fullPublicId,
    resourceType: "image",
  });

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: fullPublicId },
  });

  return { publicId: fullPublicId, version: meta.version };
}

/**
 * Supprime l'avatar : fichier Cloudinary + champ User.avatar.
 * Best-effort côté Cloudinary (un avatar déjà absent n'est pas une erreur).
 */
export async function deleteAvatar(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<void> {
  const { prisma, appRoot, userId } = params;
  const fullPublicId = avatarPublicId(appRoot, userId);

  try {
    await cloudinary.uploader.destroy(fullPublicId, {
      resource_type: "image",
      type: "authenticated",
      invalidate: true,
    });
  } catch {
    // avatar déjà absent côté Cloudinary — rien à faire
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  });
}
FILE_EOF

echo "-> packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"
cat > 'packages/backend/src/modules/cloudinary/services/cloudinary.service.ts' << 'FILE_EOF'
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";
import type { TransformationOptions } from "cloudinary";
import {
  getCached,
  setCached,
  invalidate as invalidateResourcesCache,
} from "@backend/modules/cloudinary/cache/resourcesCache";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type ResourceType = "image" | "video" | "raw";
export type Variant = "thumb" | "small" | "medium" | "large" | "original";

export interface ListAuthenticatedResourcesResult {
  publicId: string;
  url: string;
  /**
   * Format technique de l'asset (`jpg`, `png`, `mp4`, ...).
   *
   * L'API Cloudinary `resources` retourne ce champ pour chaque asset ;
   * on le préserve ici pour qu'il puisse remonter jusqu'au `FileNode`
   * du tree et au front (qui s'en sert pour calculer `kind` = image/video/document).
   */
  format?: string;
}

interface GetAssetInfoResult {
  resource_type: ResourceType;
  bytes?: number;
  created_at?: string;
  asset_id?: string;
  format?: string;
}

/* -------------------------------------------------------------------------- */
/*                              CONFIG TRANSFO                                */
/* -------------------------------------------------------------------------- */

const transformations: Record<Variant, TransformationOptions> = {
  thumb: { width: 150, height: 150, crop: "fill" },
  small: { width: 300, crop: "scale" },
  medium: { width: 600, crop: "scale" },
  large: { width: 1200, crop: "scale" },
  original: {},
};

/* -------------------------------------------------------------------------- */
/*                             CORE CLOUDINARY                                */
/* -------------------------------------------------------------------------- */

/**
 * Génère une URL signée pour un asset Cloudinary authenticated.
 */
export function buildAuthenticatedUrl(
  publicId: string,
  variant: Variant,
  resourceType: ResourceType = "image",
  version?: number,
): string {
  const transformation = transformations[variant] ?? {};

  return cloudinary.url(publicId, {
    transformation,
    sign_url: true,
    type: "authenticated",
    resource_type: resourceType,
    secure: true,
    // Version Cloudinary (numéro du binaire) : produit une URL `.../v<n>/...`
    // que le CDN traite comme unique. Sans elle, un asset écrasé (publicId
    // fixe, ex. avatar) sert l'ANCIEN binaire encore en cache CDN.
    ...(version ? { version } : {}),
  });
}

/**
 * Récupère un asset Cloudinary authenticated.
 * Retourne le Response natif (streamable).
 */
export async function fetchAuthenticatedAsset(
  publicId: string,
  variant: Variant,
  version?: number,
): Promise<Response | null> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const url = buildAuthenticatedUrl(publicId, variant, rt, version);

      const res = await fetch(url, {
        cache: "no-store",
      });

      if (!res.ok) continue;

      return res; // ✅ on retourne le Response natif
    } catch {
      // on tente le prochain resource_type
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              METADATA / CHECK                              */
/* -------------------------------------------------------------------------- */

/**
 * Récupère les métadonnées d'un asset (multi resource_type).
 */
export async function getAssetInfo(
  publicId: string,
): Promise<GetAssetInfoResult> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: "authenticated",
        resource_type: rt,
      });
      console.log("[asset_id check]", res?.asset_id, res?.public_id);

      if (res?.public_id) {
        return {
          resource_type: rt,
          bytes: typeof res.bytes === "number" ? res.bytes : undefined,
          created_at: res.created_at ? String(res.created_at) : undefined,
          asset_id: typeof res.asset_id === "string" ? res.asset_id : undefined,
          format: typeof res.format === "string" ? res.format : undefined,
        };
      }
    } catch {
      // try next
    }
  }

  throw new Error(`Asset not found (any resource_type): ${publicId}`);
}

/**
 * Vérifie l'existence d'un asset (sans throw).
 */
export async function fileExists(publicId: string): Promise<boolean> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: "authenticated",
        resource_type: rt,
      });

      if (res?.public_id) return true;
    } catch {
      // continue
    }
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

/**
 * Supprime tous les assets ET tous les dossiers sous un prefix.
 *
 * ─── Pourquoi 2 étapes ? ─────────────────────────────────────────────────
 *
 * Cloudinary distingue deux concepts indépendants :
 *
 *   1. **Assets** : les fichiers (images, vidéos, raw). Listés par
 *      `api.resources`, supprimés par `api.delete_resources_by_prefix`.
 *
 *   2. **Folders** : les "dossiers" qui peuvent exister indépendamment
 *      des assets — soit créés explicitement via `api.create_folder`,
 *      soit créés implicitement quand un asset y est uploadé. Listés
 *      par `api.sub_folders`, supprimés par `api.delete_folder` (qui
 *      n'accepte QUE les dossiers vides).
 *
 * `delete_resources_by_prefix` ne touche pas aux dossiers. Donc après
 * suppression des assets, des dossiers vides peuvent subsister sous le
 * prefix → ils restent visibles dans la TreeView du finder (qui consomme
 * `api.sub_folders` pour bâtir l'arbo), perçus comme des "vestiges".
 *
 * Cette fonction règle le problème en complétant la suppression des
 * assets par une suppression récursive des sous-dossiers (depth-first,
 * pour que les enfants soient vides avant qu'on supprime leur parent).
 *
 * Invalide le cache des resources à la fin — les entrées cachées sont
 * stale dès qu'on a muté la structure.
 */
export async function deleteByPrefix(
  prefix: string,
): Promise<{ success: boolean }> {
  // ─── Étape 1 : supprimer tous les assets sous le prefix ─────────────────
  for (const resourceType of ["image", "video", "raw"] as const) {
    await cloudinary.api.delete_resources_by_prefix(prefix, {
      type: "authenticated",
      resource_type: resourceType,
    });
  }

  // ─── Étape 2 : supprimer récursivement les sous-dossiers vides ──────────
  //
  // Une fois les assets supprimés, on peut tenter de supprimer le dossier
  // racine `prefix` lui-même via `deleteCloudinaryFolderRecursive`. Cette
  // helper descend en profondeur (DFS) pour vider les enfants avant le
  // parent — sinon `delete_folder` échoue avec "folder not empty".
  //
  // On tolère silencieusement les erreurs : si le dossier n'existe pas
  // (cas typique d'un `prefix` sans aucun asset historique), pas grave.
  await deleteCloudinaryFolderRecursive(prefix);

  invalidateResourcesCache();

  return { success: true };
}

/**
 * Helper interne — supprime récursivement un dossier Cloudinary et tous
 * ses sous-dossiers, depth-first. À appeler APRÈS avoir supprimé les
 * assets sous ce dossier (sinon `delete_folder` échoue).
 *
 * Tolère :
 *   - Le dossier qui n'existe pas (ex: prefix orphelin) → no-op silencieux.
 *   - Erreurs de listage d'un sous-dossier → log et continue (on supprime
 *     ce qu'on peut, on ne bloque pas tout le batch sur un cas particulier).
 */
export async function deleteCloudinaryFolderRecursive(
  folderPath: string,
): Promise<void> {
  // Liste les sous-dossiers directs.
  let subFolders: Array<{ name: string; path: string }> = [];
  try {
    const result = await cloudinary.api.sub_folders(folderPath);
    subFolders = (result.folders ?? []) as Array<{
      name: string;
      path: string;
    }>;
  } catch (err) {
    const desc = describeCloudinaryError(err);
    // Le dossier n'existe pas → nothing to do, on retourne silencieusement.
    // Cloudinary répond typiquement avec "Folder not found" ou HTTP 404.
    if (
      desc.message.toLowerCase().includes("not found") ||
      desc.http_code === 404
    ) {
      return;
    }
    // Autre erreur : on log et on continue (on ne propage pas — la fonction
    // est utilisée dans des batches où une erreur partielle ne doit pas
    // bloquer le reste).
    console.warn(
      `[deleteCloudinaryFolderRecursive] sub_folders failed for '${folderPath}':`,
      desc,
    );
    return;
  }

  // DFS : on vide d'abord les enfants pour pouvoir supprimer le parent.
  for (const sub of subFolders) {
    await deleteCloudinaryFolderRecursive(sub.path);
  }

  // Maintenant le dossier `folderPath` ne devrait plus avoir de sous-dossiers.
  // On tente de le supprimer. Encore tolérant — si le dossier contient
  // encore des assets cachés (par exemple resource_type pas couvert ailleurs),
  // l'API renverra une erreur qu'on log mais sans bloquer.
  try {
    await cloudinary.api.delete_folder(folderPath);
  } catch (err) {
    const desc = describeCloudinaryError(err);
    if (
      desc.message.toLowerCase().includes("not found") ||
      desc.http_code === 404
    ) {
      // Pas un échec — le dossier n'existait déjà plus.
      return;
    }
    console.warn(
      `[deleteCloudinaryFolderRecursive] delete_folder failed for '${folderPath}':`,
      desc,
    );
  }
}

/**
 * Helper pour extraire un message + http_code lisible depuis une erreur
 * Cloudinary. L'API admin renvoie typiquement
 *   { error: { message, http_code }, http_code, name, ... }
 * — quand on fait `String(err)` ou `err.message` directement, on obtient
 * `[object Object]` ou `undefined`. Ce helper sait dénormaliser.
 */
function describeCloudinaryError(err: unknown): {
  message: string;
  http_code?: number;
} {
  if (err instanceof Error) {
    return { message: err.message };
  }
  if (typeof err === "string") {
    return { message: err };
  }
  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    const inner =
      obj.error && typeof obj.error === "object"
        ? (obj.error as Record<string, unknown>)
        : null;
    const message = String(
      inner?.message ?? obj.message ?? JSON.stringify(err) ?? "<unknown>",
    );
    const http_code =
      typeof inner?.http_code === "number"
        ? inner.http_code
        : typeof obj.http_code === "number"
          ? obj.http_code
          : undefined;
    return { message, http_code };
  }
  return { message: String(err) };
}

/* -------------------------------------------------------------------------- */
/*                                   LIST                                     */
/* -------------------------------------------------------------------------- */

/**
 * Liste les assets authenticated sous un prefix.
 *
 * 🚀 Utilise un cache in-memory (`resourcesCache`) pour court-circuiter
 * les appels répétés sur le même prefix — l'API admin Cloudinary mettant
 * typiquement plusieurs secondes par appel, le cache rend la navigation
 * du finder fluide en dehors du tout premier appel.
 *
 * Le cache est invalidé automatiquement lors de toute mutation
 * (cf. `deleteByPrefix` ci-dessus, et les services move / register).
 *
 * ─── ⚠️ Subtilité Cloudinary : 3 resource_type distincts ─────────────────
 *
 * L'API `cloudinary.api.resources()` filtre **silencieusement** sur
 * `resource_type=image` par défaut. Sans spécifier, les vidéos et les
 * fichiers raw (PDF, ZIP, etc.) sont **ignorés** sans erreur.
 *
 * Cloudinary catégorise tous les assets en 3 buckets disjoints :
 *   - `image` : JPG, PNG, WebP, AVIF, GIF…
 *   - `video` : MP4, MOV, WebM, et — sans doute surprenant — les audios
 *               (MP3, WAV, M4A) que Cloudinary range avec les vidéos
 *   - `raw`   : PDF, ZIP, DOCX, TXT, tout le reste
 *
 * Pour avoir la liste complète, on doit faire **3 appels en parallèle**
 * (un par resource_type) et merger les résultats. Coût latence : 0
 * (parallélisé), coût quotas : 3 appels au lieu d'un.
 *
 * 💡 Dans notre archi AKFC :
 *   - Cloudinary stocke image + video (cf. `pickBackendByExtension`)
 *   - R2 stocke audio + raw (PDF, ZIP, MD, DOCX…)
 * Mais on garde l'appel `raw` ici par robustesse : si jamais un fichier
 * était poussé en raw sur Cloudinary historiquement (ou par un autre
 * outil), on ne le perd pas du finder.
 *
 * Si l'un des 3 appels échoue, on garde les résultats des autres
 * (Promise.allSettled) et on log l'erreur — un cas "tous les images
 * mais pas les vidéos" est moins pire que "rien du tout".
 */
export async function listAuthenticatedResources(
  prefix: string,
): Promise<ListAuthenticatedResourcesResult[]> {
  const cached = getCached(prefix);
  if (cached !== null) {
    return cached;
  }

  const baseArgs = {
    type: "authenticated" as const,
    prefix,
    max_results: 500,
  };

  const settled = await Promise.allSettled([
    cloudinary.api.resources({ ...baseArgs, resource_type: "image" }),
    cloudinary.api.resources({ ...baseArgs, resource_type: "video" }),
    cloudinary.api.resources({ ...baseArgs, resource_type: "raw" }),
  ]);

  const mapped: ListAuthenticatedResourcesResult[] = [];
  const labels = ["image", "video", "raw"] as const;

  // for (let i = 0; i < settled.length; i++) {
  //   const o = settled[i];
  // }

  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];
    if (outcome.status === "rejected") {
      // On log mais on continue : mieux vaut une liste partielle qu'aucune.
      console.error(
        `[listAuthenticatedResources] resource_type=${labels[i]} failed for prefix '${prefix}':`,
        outcome.reason,
      );
      continue;
    }
    for (const r of outcome.value.resources) {
      mapped.push({
        publicId: r.public_id,
        url: r.secure_url,
        format: r.format,
      });
    }
  }

  setCached(prefix, mapped);

  return mapped;
}

/**
 * Construit une URL signée vers le POSTER (frame représentative) d'une vidéo
 * authenticated. Cloudinary génère l'image à la volée : resource_type vidéo +
 * format jpg + start_offset auto (frame non-noire choisie automatiquement).
 *
 * Distinct de buildAuthenticatedUrl, qui applique des transformations IMAGE
 * sur le resource_type détecté — inadapté pour extraire une frame d'une vidéo.
 */
export function buildVideoPosterUrl(
  publicId: string,
  variant: Variant = "large",
): string {
  const sizing = transformations[variant] ?? {};
  return cloudinary.url(publicId, {
    resource_type: "video",
    type: "authenticated",
    format: "jpg",
    sign_url: true,
    secure: true,
    transformation: [{ start_offset: "0" }, sizing],
  });
}

/**
 * Récupère le poster d'une vidéo authenticated. Retourne le Response natif (streamable).
 *
 * @param publicId
 * @param variant
 * @returns
 */
export async function fetchVideoPoster(
  publicId: string,
  variant: Variant,
): Promise<Response | null> {
  try {
    const url = buildVideoPosterUrl(publicId, variant);
    console.log("[poster] url=", url);
    const res = await fetch(url, { cache: "no-store" });
    console.log(
      "[poster] status=",
      res.status,
      "ct=",
      res.headers.get("content-type"),
    );
    if (!res.ok) return null;
    return res;
  } catch (e) {
    console.log("[poster] threw", e);
    return null;
  }
}
FILE_EOF

echo "-> apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts"
cat > 'apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts' << 'FILE_EOF'
import { NextRequest } from "next/server";
import {
  fetchAuthenticatedAsset,
  fetchVideoPoster,
} from "@backend/modules/cloudinary/services/cloudinary.service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Variant = "thumb" | "small" | "medium" | "large" | "original";

function parseVariant(value: string | null): Variant {
  if (value === "thumb") return "thumb";
  if (value === "small") return "small";
  if (value === "medium") return "medium";
  if (value === "large") return "large";
  if (value === "original") return "original";
  return "large";
}

/* -------------------------------------------------------------------------- */
/*                               FALLBACK IMAGE                               */
/* -------------------------------------------------------------------------- */

// 👉 à remplacer par un vrai asset public (Cloudinary ou local)
const FALLBACK_URL =
  "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string[] }> },
) {
  try {
    const { publicId } = await params;

    const id = publicId?.join("/");

    if (!id) {
      return new Response("Missing publicId", { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const variant = parseVariant(searchParams.get("variant"));
    const asPoster = searchParams.get("as") === "poster";
    // `v` = version Cloudinary du binaire (transmise par le store d'avatar).
    // Passée à Cloudinary, elle garantit le bon fichier malgré un publicId
    // fixe écrasé (sinon l'ancien binaire caché sur le CDN).
    const vParam = searchParams.get("v");
    const version = vParam ? Number(vParam) : undefined;
    const safeVersion =
      version && Number.isFinite(version) ? version : undefined;

    const asset = asPoster
      ? await fetchVideoPoster(id, variant)
      : await fetchAuthenticatedAsset(id, variant, safeVersion);

    /* ---------------------------------------------------------------------- */
    /*                               NOT FOUND                                */
    /* ---------------------------------------------------------------------- */

    if (!asset || !asset.ok || !asset.body) {
      console.warn(`[media] asset not found → fallback`, { id, variant });

      const fallback = await fetch(FALLBACK_URL);

      if (!fallback.ok || !fallback.body) {
        return new Response("Fallback failed", { status: 500 });
      }

      return new Response(fallback.body, {
        status: 200,
        headers: buildHeaders(fallback, true),
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                                SUCCESS                                 */
    /* ---------------------------------------------------------------------- */

    return new Response(asset.body, {
      status: 200,
      headers: buildHeaders(asset),
    });
  } catch (error) {
    console.error("[media] unexpected error", error);

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                                HEADERS BUILDER                             */
/* -------------------------------------------------------------------------- */

function buildHeaders(res: Response, isFallback = false): HeadersInit {
  const contentType =
    res.headers.get("content-type") ?? "application/octet-stream";

  return {
    "Content-Type": contentType,

    // 🔥 CDN / navigateur cache
    "Cache-Control": isFallback
      ? "public, max-age=60" // fallback → court
      : "public, max-age=31536000, immutable",

    // 🔥 optionnel mais utile (debug / observabilité)
    "X-Asset-Source": isFallback ? "fallback" : "cloudinary",
  };
}
FILE_EOF

echo "-> apps/web/src/lib/stores/useAvatarVersionStore.ts"
cat > 'apps/web/src/lib/stores/useAvatarVersionStore.ts' << 'FILE_EOF'
import { create } from "zustand";

/**
 * Version d'avatar PAR utilisateur, partagée dans toute l'app.
 *
 * Problème résolu : l'avatar a un publicId FIXE (`.../avatar`), donc son URL
 * ne change jamais d'un upload à l'autre, et la route le sert en cache
 * `immutable`. Sans signal de version, aucune vue (uploader, header, posts,
 * commentaires…) ne rafraîchit l'image après un changement.
 *
 * Ce store tient un jeton de version par userId. TOUTE URL d'avatar y ajoute
 * `?v=<version>`. Bumper la version d'un user (au changement d'avatar)
 * recharge son image PARTOUT simultanément — un seul point de vérité.
 */
interface AvatarVersionStore {
  /** userId → jeton de version (timestamp du dernier changement). */
  versions: Record<string, number>;
  /** Version courante d'un user (0 si jamais changé cette session). */
  getVersion: (userId: string) => number;
  /**
   * Fixe la version d'un user partout dans l'app. Passer la `version`
   * Cloudinary (numéro du binaire) garantit que l'URL pointe vers le bon
   * fichier ; à défaut, un timestamp force au moins le rechargement.
   */
  bump: (userId: string, version?: number) => void;
}

export const useAvatarVersionStore = create<AvatarVersionStore>((set, get) => ({
  versions: {},
  getVersion: (userId) => get().versions[userId] ?? 0,
  bump: (userId, version) =>
    set((state) => ({
      versions: {
        ...state.versions,
        [userId]: version ?? Date.now(),
      },
    })),
}));
FILE_EOF

echo "-> apps/web/src/features/avatar/AvatarUploader.tsx"
cat > 'apps/web/src/features/avatar/AvatarUploader.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  Check,
  ImageUp,
  Loader2,
  Trash2,
  Video,
  X,
} from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useAvatarVersionStore } from "@lib/stores/useAvatarVersionStore";
import { useSessionStore } from "@lib/stores/useSessionStore";
import Cropper from "@features/gallery-crop/components/Cropper";
import type { PictureItem } from "@features/gallery-crop/types/picture.types";
import type { CropResult } from "@features/gallery-crop/types/cropper.types";
import { toSquareFile } from "@features/avatar/toSquareFile";
import { CameraCapture } from "@features/avatar/CameraCapture";

/**
 * AvatarUploader — trois sources (glisser-déposer, picker fichier, caméra
 * frontale) convergent vers le Cropper, puis un carré 1:1 (toSquareFile).
 *
 * FLUX AVEC CONFIRMATION (option A) : le crop ne déclenche PAS l'upload. Il
 * produit une preview LOCALE, affichée à côté de l'avatar actuel (avant /
 * après, séparés d'une barre verticale). L'upload+register+bump n'a lieu
 * qu'au clic « valider » (✓) ; « annuler » (✗) jette la preview et garde
 * l'ancien. Rien n'écrase Cloudinary tant que l'utilisateur n'a pas confirmé.
 *
 * Le refresh partout (header, posts…) passe par le store de version.
 */

function avatarUrl(publicId: string | null, version?: number): string | null {
  if (!publicId) return null;
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  const v = version ? `&v=${version}` : "";
  return `/api/media/by-public-id/${enc}?variant=large${v}`;
}

interface AvatarUploaderProps {
  onChanged?: (publicId: string | null) => void;
}

export function AvatarUploader({
  onChanged,
}: AvatarUploaderProps = {}): JSX.Element {
  const utils = trpc.useUtils();
  const { data } = trpc.avatar.getMine.useQuery();
  const getSignature = trpc.avatar.getUploadSignature.useMutation();
  const register = trpc.avatar.register.useMutation();
  const remove = trpc.avatar.remove.useMutation();

  const userId = useSessionStore((s) => s.session?.user?.id ?? null);
  const bumpAvatar = useAvatarVersionStore((s) => s.bump);
  const version = useAvatarVersionStore((s) =>
    userId ? (s.versions[userId] ?? 0) : 0,
  );

  const [itemToCrop, setItemToCrop] = useState<PictureItem | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview LOCALE du nouveau cliché (post-crop, avant upload). Tant qu'elle
  // est non-null, on est en mode confirmation (avant / après).
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl = useMemo(
    () => avatarUrl(data?.publicId ?? null, version),
    [data?.publicId, version],
  );

  // Libère l'objectURL de la preview quand elle change / au démontage.
  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const startCrop = (file: File) => {
    setError(null);
    setItemToCrop({
      id: crypto.randomUUID(),
      file,
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
    onDrop: (files) => {
      if (files[0]) startCrop(files[0]);
    },
  });

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) startCrop(file);
  };

  const onCameraCapture = (file: File) => {
    setCameraOpen(false);
    startCrop(file);
  };

  // Crop terminé → preview LOCALE (pas d'upload). Passe en mode confirmation.
  const handleCrop = async ({ croppedFile }: CropResult) => {
    setItemToCrop(null);
    setError(null);
    try {
      const squared = await toSquareFile(croppedFile);
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
      setPendingFile(squared);
      setPendingUrl(URL.createObjectURL(squared));
    } catch {
      setError("Impossible de préparer l'image.");
    }
  };

  // ✓ valider : upload + register + bump (le remplacement effectif).
  const confirmPending = async () => {
    if (!pendingFile) return;
    setBusy(true);
    setError(null);
    try {
      const sig = await getSignature.mutateAsync();

      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);
      formData.append("public_id", sig.publicId);
      formData.append("type", sig.type);
      formData.append("overwrite", String(sig.overwrite));

      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}`);

      const registered = await register.mutateAsync();
      await utils.avatar.getMine.invalidate();
      if (userId) bumpAvatar(userId, registered.version ?? undefined);
      onChanged?.(registered.publicId);

      cancelPending();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'upload de l'avatar.",
      );
    } finally {
      setBusy(false);
    }
  };

  // ✗ annuler : jette la preview, garde l'ancien.
  const cancelPending = () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
  };

  const handleRemove = async () => {
    setBusy(true);
    setError(null);
    try {
      await remove.mutateAsync();
      await utils.avatar.getMine.invalidate();
      if (userId) bumpAvatar(userId);
      onChanged?.(null);
    } catch {
      setError("Suppression impossible.");
    } finally {
      setBusy(false);
    }
  };

  const inConfirm = pendingUrl !== null;

  return (
    <div className="flex flex-col items-center gap-3">
      {inConfirm ? (
        /* -------- MODE CONFIRMATION : avant / après -------- */
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-stretch gap-4">
            {/* Avant (actuel) */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs uppercase tracking-wide text-gray-400">
                Actuel
              </span>
              <div className="h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {currentUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- proxy signé
                  <img
                    key={currentUrl}
                    src={currentUrl}
                    alt="Avatar actuel"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
            </div>

            {/* Barre verticale de séparation */}
            <div className="w-px self-stretch bg-gray-300" />

            {/* Après (nouveau) + boutons ✓ / ✗ */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs uppercase tracking-wide text-emerald-600">
                Nouveau
              </span>
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-emerald-400 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob local */}
                <img
                  src={pendingUrl}
                  alt="Nouvel avatar"
                  className="h-full w-full object-cover"
                />
                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={cancelPending}
                  aria-label="Annuler"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={confirmPending}
                  aria-label="Valider"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        /* -------- MODE NORMAL : avatar actuel + sources -------- */
        <>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center gap-3 rounded-lg p-3 transition-colors ${
              isDragActive ? "bg-emerald-50 ring-2 ring-emerald-300" : ""
            }`}
          >
            <input {...getInputProps()} />
            <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {currentUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- proxy signé
                <img
                  key={currentUrl}
                  src={currentUrl}
                  alt="Votre avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <Camera className="h-8 w-8" />
                </div>
              )}
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {isDragActive
                ? "Déposez l'image ici"
                : "ou glissez une image ici"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <ImageUp className="h-4 w-4" />
              Choisir un fichier
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setCameraOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <Video className="h-4 w-4" />
              Caméra
            </button>
            {data?.publicId && (
              <button
                type="button"
                disabled={busy}
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Retirer
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickFile}
      />

      {itemToCrop && (
        <Cropper
          picture={itemToCrop}
          onCancel={() => setItemToCrop(null)}
          onCrop={handleCrop}
        />
      )}

      {cameraOpen && (
        <CameraCapture
          onCapture={onCameraCapture}
          onCancel={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
FILE_EOF

echo
pnpm --filter backend typecheck && pnpm --filter web typecheck