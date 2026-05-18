import { z } from 'zod';

export const UploadFileSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),

  // 👇 contexte métier
  context: z.object({
    folderPath: z.string(),
    // extensible (eventId, userId, etc.)
  }),
});

export type UploadFileInput = z.infer<typeof UploadFileSchema>;