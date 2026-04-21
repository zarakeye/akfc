import { cloudinary } from "@workspace/backend/modules/cloudinary/cloudinary.client";
import type { TransformationOptions } from "cloudinary";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type ResourceType = "image" | "video" | "raw";
export type Variant = "thumb" | "small" | "medium" | "large" | "original";

interface ListAuthenticatedResourcesResult {
  publicId: string;
  url: string;
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

  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*                                   LIST                                     */
/* -------------------------------------------------------------------------- */

/**
 * Liste les assets authenticated sous un prefix.
 */
export async function listAuthenticatedResources(
  prefix: string
): Promise<ListAuthenticatedResourcesResult[]> {
  const result = await cloudinary.api.resources({
    type: "authenticated",
    prefix,
    max_results: 500,
  });

  return result.resources.map((r: typeof result.resources[0]) => ({
    publicId: r.public_id,
    url: r.secure_url,
  }));
}