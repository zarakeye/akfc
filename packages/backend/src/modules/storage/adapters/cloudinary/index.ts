/**
 * Adapter Cloudinary pour le contrat de stockage agnostique.
 *
 * Point d'entrée public : `createCloudinaryStorageAdapter`. La factory
 * retourne un objet qui satisfait `StorageAdapter & UploadCapableAdapter<…>`
 * en s'appuyant sur les services Cloudinary existants.
 */

export {
  createCloudinaryStorageAdapter,
  type CloudinaryStorageAdapter,
  type CloudinaryStorageAdapterDeps,
  type CloudinaryCreateUploadAuthorizationInput,
  type CloudinaryCreateUploadAuthorizationOutput,
  type CloudinaryRegisterUploadedAssetInput,
  type CloudinaryRegisterUploadedAssetOutput,
} from "./cloudinaryStorageAdapter";
