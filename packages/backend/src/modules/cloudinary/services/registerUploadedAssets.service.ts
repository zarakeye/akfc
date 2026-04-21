import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { assertResourceTypeMatchesMimeType } from "../utils/media-validation.utils";
import { assertSafeCloudinaryPath } from "../utils/path-validation.utils";
import { readUploadedAssetMetadata } from "./readUploadedAssetMetadata.service";
import { resolvePendingUploadFolder } from "./resolvePendingUploadFolder.service";

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

type RegisteredAssetInput = {
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "video";
  originalFileName: string;
  displayName?: string;
  description?: string;
  mimeType: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  folder: string;
};

export async function registerUploadedAssets(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
  destination: Destination;
  assets: RegisteredAssetInput[];
  eventDate?: Date;
}) {
  const { prisma, appRoot, userId, destination, assets, eventDate } = params;

  const expectedFolder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
  });

  const created = await prisma.$transaction(async (tx) => {
  const out = [];

  for (const asset of assets) {
    assertSafeCloudinaryPath(asset.folder, appRoot);

    assertResourceTypeMatchesMimeType({
      resourceType: asset.resourceType,
      mimeType: asset.mimeType,
    });

    if (asset.folder !== expectedFolder) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Asset folder does not match the authorized pending destination.",
      });
    }

    if (!asset.publicId.startsWith(`${expectedFolder}/`)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Asset publicId does not match the authorized pending destination.",
      });
    }

    const cloudinaryAsset = await readUploadedAssetMetadata({
      publicId: asset.publicId,
      resourceType: asset.resourceType,
    });

    if (cloudinaryAsset.publicId !== asset.publicId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "PublicId mismatch.",
      });
    }

    if (cloudinaryAsset.secureUrl !== asset.secureUrl) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "SecureUrl mismatch.",
      });
    }

    const createdAsset = await tx.mediaAsset.create({
      data: {
        publicId: cloudinaryAsset.publicId,
        secureUrl: cloudinaryAsset.secureUrl,
        resourceType: cloudinaryAsset.resourceType,
        mimeType: asset.mimeType,
        format: cloudinaryAsset.format,
        originalFileName: asset.originalFileName,
        displayName: asset.displayName ?? null,
        description: asset.description ?? null,
        bytes: cloudinaryAsset.bytes,
        width: cloudinaryAsset.width,
        height: cloudinaryAsset.height,
        duration: cloudinaryAsset.duration,
        appRoot,
        status: "pending",
        categoryId: destination.categoryId,
        activityId:
          destination.kind === "existing-activity"
            ? destination.activityId
            : null,
        proposedActivityName:
          destination.kind === "new-activity"
            ? destination.newActivityName
            : null,
        eventDate: eventDate ?? null,
        uploadedAt: new Date(),
        uploaderUserId: userId,
      },
    });

    out.push(createdAsset);
  }

  return out;
});

  return {
    success: true as const,
    assets: created.map((asset) => ({
      id: asset.id,
      publicId: asset.publicId,
      secureUrl: asset.secureUrl,
    })),
  };
}