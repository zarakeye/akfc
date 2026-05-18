import { z } from "zod";
import {
  uploadDestinationSchema,
  uploadAssetRequestSchema,
} from "@contracts/cloudinary/upload.schema";

/* -------------------------------------------------------------------------- */
/* TYPES (source de vérité = Zod) */
/* -------------------------------------------------------------------------- */
export type UploadDestination = z.infer<typeof uploadDestinationSchema>;
export type UploadAssetRequest = z.infer<typeof uploadAssetRequestSchema>;