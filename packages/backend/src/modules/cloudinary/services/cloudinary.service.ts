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
  resourceType: ResourceType = "image"
): string {
  const transformation = transformations[variant] ?? {};

  return cloudinary.url(publicId, {
    transformation,
    sign_url: true,
    type: "authenticated",
    resource_type: resourceType,
    secure: true,
  });
}

/**
 * Récupère un asset Cloudinary authenticated.
 * Retourne le Response natif (streamable).
 */
export async function fetchAuthenticatedAsset(
  publicId: string,
  variant: Variant
): Promise<Response | null> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const url = buildAuthenticatedUrl(publicId, variant, rt);

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
  publicId: string
): Promise<GetAssetInfoResult> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: "authenticated",
        resource_type: rt,
      });

      if (res?.public_id) {
        return {
          resource_type: rt,
          bytes: typeof res.bytes === "number" ? res.bytes : undefined,
          created_at: res.created_at
            ? String(res.created_at)
            : undefined,
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
 * Supprime tous les assets d’un prefix (tous resource_type).
 *
 * Invalide le cache des resources après suppression — les entrées
 * cachées sont stale dès que des assets disparaissent.
 */
export async function deleteByPrefix(
  prefix: string
): Promise<{ success: boolean }> {
  for (const resourceType of ["image", "video", "raw"] as const) {
    await cloudinary.api.delete_resources_by_prefix(prefix, {
      type: "authenticated",
      resource_type: resourceType,
    });
  }

  invalidateResourcesCache();

  return { success: true };
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
 */
export async function listAuthenticatedResources(
  prefix: string
): Promise<ListAuthenticatedResourcesResult[]> {
  const cached = getCached(prefix);
  if (cached !== null) {
    return cached;
  }

  const result = await cloudinary.api.resources({
    type: "authenticated",
    prefix,
    max_results: 500,
  });

  const mapped: ListAuthenticatedResourcesResult[] = result.resources.map(
    (r: typeof result.resources[0]) => ({
      publicId: r.public_id,
      url: r.secure_url,
      format: r.format,
    })
  );

  setCached(prefix, mapped);

  return mapped;
}