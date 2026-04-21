import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { resolvePendingUploadFolder } from "./resolvePendingUploadFolder.service";
import type {
  UploadDestination,
  UploadAssetRequest,
  CreateUploadSignaturesOutput,
} from "../types/upload.types";

export async function createUploadSignatures(params: {
  prisma: PrismaClient;
  appRoot: string;
  destination: UploadDestination;
  assets: UploadAssetRequest[];
}): Promise<CreateUploadSignaturesOutput> {
  const { prisma, appRoot, destination, assets } = params;

  const folder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
  });

  const timestamp = Math.floor(Date.now() / 1000);

  return assets.map((asset) => {
    const publicId = asset.fileName.replace(/\.[^/.]+$/, "");

    const toSign = {
      folder,
      timestamp,
      public_id: publicId,
      type: "authenticated",
    };

    const signature = crypto
      .createHash("sha1")
      .update(
        Object.keys(toSign)
          .sort()
          .map((k) => `${k}=${toSign[k as keyof typeof toSign]}`)
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
      type: "authenticated" as const,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    };
  });
}