import { z } from "zod";

/**
 * upload.schema.ts
 *
 * Contrat Zod de la chaîne d'upload signé — partagé backend/frontend.
 *
 * `Destination` est un discriminated union qui encode l'intention métier :
 *   - `existing-discipline` : pointer vers une Discipline déjà inscrite en DB
 *   - `new-discipline`      : proposer un nom de Discipline qu'un admin
 *                             devra valider après coup (pattern de commit
 *                             différé — côté DB, `MediaAsset.disciplineId`
 *                             reste null et `MediaAsset.proposedDisciplineName`
 *                             porte le nom proposé jusqu'à validation).
 */

export const uploadDestinationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("existing-discipline"),
    categoryId: z.number().int().positive(),
    disciplineId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("new-discipline"),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().trim().min(1).max(120),
  }),
  // ── Destinations découplées de la discipline (fondation) ──
  // `general` : contenus du club sans discipline ni catégorie. Fait office
  //             d'espace partagé de fait entre admins (pas de permissions :
  //             club petit, confiance).
  z.object({
    kind: z.literal("common_repository"),
    // Sous-dossier OPTIONNEL sous `general/` (existant ou créé à la volée).
    // Absent → dépôt à la racine de `general/`.
    containerName: z.string().trim().min(1).max(120).optional(),
  }),
  // `perso`   : espace personnel de l'admin. Aucune identité transportée ici —
  //             le dossier cible est dérivé côté serveur de `ctx.user.id`, si
  //             bien qu'un admin ne peut uploader QUE dans son propre dossier.
  z.object({
    kind: z.literal("perso"),
  }),
  // `event` : contenus d'un événement (forum des associations, démonstration).
  // L'événement est créé par les admins ; le membre le choisit ici. Les
  // `disciplineIds` ENRICHISSENT les disciplines de l'événement (elles
  // décrivent l'ÉVÉNEMENT, pas chaque photo).
  z.object({
    kind: z.literal("event"),
    eventId: z.number().int().positive(),
    disciplineIds: z.array(z.number().int().positive()).default([]),
  }),
  // `stage` : contenus d'un stage existant (interne ou externe au club).
  // Le stage est créé par les admins ; on en choisit un ici. Rattachement
  // par le chemin `stages/…` (MediaAsset n'a pas de stageId).
  z.object({
    kind: z.literal("stage"),
    stageId: z.number().int().positive(),
  }),
  // Espace d'un groupe collaboratif : dépôt réservé aux éditeurs/admins
  // (garde côté router). Rattachement par le chemin `groups/…`.
  z.object({
    kind: z.literal("group"),
    groupId: z.string(),
  }),
]);

export const uploadAssetRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  mediaType: z.enum(["image", "video"]),
});

export const createUploadSignaturesSchema = z.object({
  destination: uploadDestinationSchema,
  assets: z.array(uploadAssetRequestSchema).min(1).max(20),
  /**
   * Autorise l'écrasement d'un asset existant (même public_id).
   *
   * - absent / false (DÉFAUT) : la signature est calculée avec
   *   `overwrite: false`. Cloudinary REFUSE alors d'écraser un public_id
   *   déjà présent → le binaire d'origine est protégé même si le client
   *   tente l'upload par erreur. C'est le filet "dormir tranquille".
   * - true : signé `overwrite: true`, à n'envoyer qu'APRÈS confirmation
   *   explicite de l'utilisateur (dialogue « Écraser »).
   */
  allowOverwrite: z.boolean().optional(),
});

export const registeredAssetSchema = z.object({
  publicId: z.string().trim().min(1).max(500),
  secureUrl: z.string().url(),
  resourceType: z.enum(["image", "video"]),
  originalFileName: z.string().trim().min(1).max(255),
  displayName: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  mimeType: z.string().trim().min(1).max(120),
  format: z.string().trim().min(1).max(50).optional(),
  bytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  folder: z.string().trim().min(1).max(500),
});

export const registerUploadedAssetsSchema = z.object({
  destination: uploadDestinationSchema,
  eventDate: z.coerce.date().optional(),
  assets: z.array(registeredAssetSchema).min(1).max(20),
});