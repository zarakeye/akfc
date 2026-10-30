import { z } from "zod";

import { uploadDestinationSchema } from "@contracts/storage/upload-destination.schema";

/**
 * Schemas Zod des procédures tRPC d'envoi vers R2 (seul stockage du site).
 *
 * Séquence : le client demande une autorisation (URL présignée), envoie le
 * fichier directement au bucket, puis fait enregistrer le MediaAsset.
 */

/* -------------------------------------------------------------------------- */
/*  Input : demande d'autorisation d'upload                                   */
/* -------------------------------------------------------------------------- */

/**
 * Limite dure d'un envoi : 500 MiB, cohérent avec l'usage AKFC (audios, PDFs, archives). Au-delà, il
 * faudrait un envoi en plusieurs parties (multipart). Une seule définition : le schéma refuse tôt une
 * taille annoncée trop grande, l'adaptateur R2 vérifie la taille RÉELLE à l'enregistrement.
 */
export const HARD_MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const createR2UploadAuthorizationSchema = z.object({
  /**
   * Remplacer un fichier existant du même nom, après confirmation de l'utilisateur. Absent : le
   * serveur refuse (CONFLICT) plutôt que d'écraser en silence.
   */
  allowOverwrite: z.boolean().optional(),

  /**
   * Destination métier — le serveur en dérive le chemin. Le client ne
   * calcule jamais de chemin (une seule règle de slug, côté serveur).
   */
  destination: uploadDestinationSchema,

  /**
   * Nom de fichier d'origine. Le serveur en tire une clé sûre via
   * `buildUploadFileName` — même règle pour tous les providers.
   */
  originalFileName: z.string().min(1).max(255),

  /**
   * MIME type du fichier qui sera envoyé. Il est signé dans l'URL d'envoi
   * (PUT présigné) : un envoi avec un autre Content-Type est refusé par le
   * stockage.
   */
  mimeType: z.string().min(1),

  /**
   * Taille annoncée, bornée par `HARD_MAX_UPLOAD_BYTES` (500 MiB). L'URL
   * présignée ne fixe pas la taille : c'est l'enregistrement
   * (`registerR2Upload`) qui vérifie la taille réelle et supprime un objet
   * refusé.
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
