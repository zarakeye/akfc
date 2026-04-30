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

export const uploadDestinationSchema = z.union([
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
]);

export const uploadAssetRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  mediaType: z.enum(["image", "video"]),
});

export const createUploadSignaturesSchema = z.object({
  destination: uploadDestinationSchema,
  assets: z.array(uploadAssetRequestSchema).min(1).max(20),
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