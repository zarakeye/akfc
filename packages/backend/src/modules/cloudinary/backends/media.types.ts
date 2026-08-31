/**
 * Contrat commun des backends média. La façade `cloudinary.service` sélectionne
 * l'implémentation (Cloudinary ou local MinIO+imgproxy) selon `STORAGE_DRIVER`.
 * Les deux backends implémentent `MediaBackend` — d'où une conformité vérifiée
 * au compile-time, garantie que le driver local ne pourra pas diverger.
 */

export type ResourceType = "image" | "video" | "raw";
export type Variant = "thumb" | "small" | "medium" | "large" | "original";

export interface ListAuthenticatedResourcesResult {
  publicId: string;
  url: string;
  /** Format technique (`jpg`, `png`, `mp4`, …) — sert à calculer `kind` au front. */
  format?: string;
}

export interface GetAssetInfoResult {
  resource_type: ResourceType;
  bytes?: number;
  created_at?: string;
  asset_id?: string;
  format?: string;
}

export interface MediaBackend {
  buildAuthenticatedUrl(
    publicId: string,
    variant: Variant,
    resourceType?: ResourceType,
    version?: number,
    format?: string,
  ): string;
  fetchAuthenticatedAsset(
    publicId: string,
    variant: Variant,
    version?: number,
    format?: string,
  ): Promise<Response | null>;
  getAssetInfo(publicId: string): Promise<GetAssetInfoResult>;
  fileExists(publicId: string): Promise<boolean>;
  listAuthenticatedResources(
    prefix: string,
  ): Promise<ListAuthenticatedResourcesResult[]>;
  deleteByPrefix(prefix: string): Promise<{ success: boolean }>;
  deleteCloudinaryFolderRecursive(prefix: string): Promise<void>;
  buildVideoPosterUrl(publicId: string, variant?: Variant): string;
  fetchVideoPoster(
    publicId: string,
    variant: Variant,
  ): Promise<Response | null>;
}
