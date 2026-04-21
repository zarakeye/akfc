import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { assertSupportedMimeType } from "../utils/media-validation.utils";
import { sanitizeBaseName } from "../utils/path-validation.utils";
import { resolvePendingUploadFolder } from "../services/resolvePendingUploadFolder.service";

type Destination =
  | {
      kind: "existing-activity";
      categoryId: number;
      activityId: number;
    }
  | {
      kind: "new-activity";
      categoryId: number;
      newActivityName: string;
    };

type AssetInput = {
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video";
};

export async function createUploadSignatures(params: {
  prisma: PrismaClient;
  appRoot: string;
  destination: Destination;
  assets: AssetInput[];
}) {
  const { prisma, appRoot, destination, assets } = params;

  const folder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
  });

  const timestamp = Math.floor(Date.now() / 1000);

  return {
    success: true as const,
    uploads: assets.map((asset) => {
      assertSupportedMimeType({
        mimeType: asset.mimeType,
        mediaType: asset.mediaType,
      });

      const publicId = `${folder}/${sanitizeBaseName(asset.fileName)}`;

      const signaturePayload = {
        public_id: publicId,
        timestamp,
      };

      const signature = crypto
        .createHash("sha1")
        .update(
          Object.keys(signaturePayload)
            .sort()
            .map((key) => `${key}=${signaturePayload[key as keyof typeof signaturePayload]}`)
            .join("&") + process.env.CLOUDINARY_API_SECRET
        )
        .digest("hex");

      return {
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        mediaType: asset.mediaType,
        resourceType: asset.mediaType,
        folder,
        publicId,
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      };
    }),
  };
}