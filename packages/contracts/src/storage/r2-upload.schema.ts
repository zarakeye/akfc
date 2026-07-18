import { z } from "zod";

import { uploadDestinationSchema } from "@contracts/cloudinary/upload.schema";

/**
 * Schemas Zod pour les procédures tRPC R2 upload.
 *
 * ─── Pourquoi des schemas dédiés à R2 (séparés de Cloudinary) ? ──────────
 *
 * Cloudinary et R2 ont des modèles d'upload fondamentalement différents :
 *
 *   - Cloudinary : signature SHA-1 d'une combinaison de params, le client
 *     envoie ensuite le fichier à l'endpoint upload de Cloudinary avec
 *     ces params + le payload.
 *
 *   - R2 (S3) : presigned POST policy avec conditions verrouillées dans
 *     la signature, le client envoie un `multipart/form-data` directement
 *     vers l'URL signée.
 *
 * Les structures d'input et d'output divergent assez pour qu'une procédure
 * unifiée devienne un "soup of fields". On préfère deux paires de procédures
 * dédiées et un dispatch côté UI (qui sait quel backend cibler via
 * `pickBackend(mimeType)`).
 *
 * Voir aussi : `@contracts/cloudinary/upload.schema.ts` pour l'équivalent
 * Cloudinary.
 */

/* -------------------------------------------------------------------------- */
/*  Input : demande d'autorisation d'upload                                   */
/* -------------------------------------------------------------------------- */

/**
 * Limite max côté contrat — duplique la garde côté adapter pour échouer
 * tôt (avant l'appel SDK). 500 MiB est cohérent avec l'usage AKFC
 * (audios, PDFs, archives). Au-delà, il faudrait un multipart upload.
 */
const HARD_MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const createR2UploadAuthorizationSchema = z.object({
  /**
   * Destination métier — le serveur en dérive le chemin, exactement comme la
   * branche Cloudinary. Le client ne calcule plus de chemin : c'était la
   * source de la divergence de slug entre les deux providers.
   */
  destination: uploadDestinationSchema,

  /**
   * Nom de fichier d'origine. Le serveur en tire une clé sûre via
   * `buildUploadFileName` — même règle pour tous les providers.
   */
  originalFileName: z.string().min(1).max(255),

  /**
   * MIME type du fichier qui sera uploadé. Sera **verrouillé dans la
   * signature** du presigned POST — toute tentative d'upload avec un
   * Content-Type différent sera rejetée par R2.
   */
  mimeType: z.string().min(1),

  /**
   * Borne supérieure de taille en octets. Bornée par
   * `HARD_MAX_UPLOAD_BYTES` (500 MiB). R2 rejettera tout upload dont
   * `Content-Length` dépasse cette valeur.
   */
  maxBytes: z
    .number()
    .int()
    .positive()
    .max(HARD_MAX_UPLOAD_BYTES, {
      message: `maxBytes ne peut pas dépasser ${HARD_MAX_UPLOAD_BYTES} octets (500 MiB). Pour les fichiers plus gros, utilise un multipart upload.`,
    }),
});

export type CreateR2UploadAuthorizationInput = z.infer<
  typeof createR2UploadAuthorizationSchema
>;

/* -------------------------------------------------------------------------- */
/*  Input : confirmation post-upload                                          */
/* -------------------------------------------------------------------------- */

/**
 * Confirme que le fichier a bien été uploadé et que ses caractéristiques
 * correspondent à ce qui était annoncé. Le backend vérifiera via HeadObject
 * que l'objet existe vraiment sur R2 et que sa taille/MIME matchent.
 *
 * Note : pas de `userId` dans le schema — c'est récupéré côté backend
 * depuis `ctx.user.id` (via la session). Le client ne peut pas le spoofer.
 */
export const registerR2UploadedAssetSchema = z.object({
  path: z.string().min(1),
  expectedBytes: z.number().int().positive(),
  expectedMimeType: z.string().min(1),
});

export type RegisterR2UploadedAssetInput = z.infer<
  typeof registerR2UploadedAssetSchema
>;
