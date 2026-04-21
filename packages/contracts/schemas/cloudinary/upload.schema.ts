import { z } from "zod";

export const uploadDestinationSchema = z.union([
  z.object({
    kind: z.literal("existing-activity"),
    categoryId: z.number().int().positive(),
    activityId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("new-activity"),
    categoryId: z.number().int().positive(),
    newActivityName: z.string().trim().min(1).max(120),
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
  appRoot: z.string().trim().min(1).max(120),
  destination: uploadDestinationSchema,
  eventDate: z.coerce.date().optional(),
  assets: z.array(registeredAssetSchema).min(1).max(20),
});