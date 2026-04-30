import { z } from "zod";

import { uploadAssetRequestSchema, uploadDestinationSchema } from "@contracts/cloudinary/upload.schema";

export type UploadDestination = z.infer<typeof uploadDestinationSchema>;

export type UploadAssetRequest = z.infer<typeof uploadAssetRequestSchema>;

export type UploadSignature = {
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video";
  resourceType: "image" | "video";
  folder: string;
  publicId: string;
  timestamp: number;
  type: "authenticated";
  signature: string;
  apiKey: string;
  cloudName: string;
};

export type CreateUploadSignaturesOutput = UploadSignature[];