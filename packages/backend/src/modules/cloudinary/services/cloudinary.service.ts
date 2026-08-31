/**
 * Façade média — point d'import unique des ~25 consommateurs.
 *
 * Sélectionne le backend selon `STORAGE_DRIVER` (défaut `cloudinary`) et
 * re-exporte ses fonctions sous les noms historiques : les consommateurs
 * importent d'ici sans rien changer. Le backend local (MinIO + imgproxy) sera
 * branché en Phase 3 — il suffira de remplacer la branche `local`.
 */
import { cloudinaryBackend } from "@backend/modules/cloudinary/backends/cloudinaryBackend";
import { localBackend } from "@backend/modules/cloudinary/backends/localBackend";
import type { MediaBackend } from "@backend/modules/cloudinary/backends/media.types";

const backend: MediaBackend =
  process.env.STORAGE_DRIVER === "local" ? localBackend : cloudinaryBackend;

export const buildAuthenticatedUrl = backend.buildAuthenticatedUrl;
export const fetchAuthenticatedAsset = backend.fetchAuthenticatedAsset;
export const getAssetInfo = backend.getAssetInfo;
export const fileExists = backend.fileExists;
export const listAuthenticatedResources = backend.listAuthenticatedResources;
export const deleteByPrefix = backend.deleteByPrefix;
export const deleteCloudinaryFolderRecursive = backend.deleteCloudinaryFolderRecursive;
export const buildVideoPosterUrl = backend.buildVideoPosterUrl;
export const fetchVideoPoster = backend.fetchVideoPoster;

export type {
  Variant,
  ResourceType,
  ListAuthenticatedResourcesResult,
  GetAssetInfoResult,
  MediaBackend,
} from "@backend/modules/cloudinary/backends/media.types";
