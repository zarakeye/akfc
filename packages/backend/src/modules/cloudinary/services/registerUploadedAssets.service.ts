import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { assertResourceTypeMatchesMimeType } from "@backend/modules/cloudinary/utils/media-validation.utils";
import { assertSafeCloudinaryPath } from "@backend/modules/cloudinary/utils/path-validation.utils";
import { readUploadedAssetMetadata } from "@backend/modules/cloudinary/services/readUploadedAssetMetadata.service";
import { resolvePendingUploadFolder } from "@backend/modules/cloudinary/services/resolvePendingUploadFolder.service";

import type { UploadDestination } from "@backend/modules/cloudinary/types/upload.types";

/**
 * registerUploadedAssets.service.ts
 *
 * Enregistre en DB des assets fraîchement uploadés sur Cloudinary (signés
 * côté serveur puis envoyés directement client → Cloudinary).
 *
 * Chaîne de vérifications, par asset :
 *   1. `assertSafeCloudinaryPath` — le folder déclaré par le client est sous
 *      `${appRoot}/pending/`, sans `..`, sans `.trash/`.
 *   2. `assertResourceTypeMatchesMimeType` — cohérence MIME ↔ resource_type.
 *   3. Égalité stricte `asset.folder === expectedFolder` — où `expectedFolder`
 *      est recalculé côté serveur par `resolvePendingUploadFolder`. Ça bloque
 *      toute tentative d'injecter un chemin non autorisé depuis le client.
 *   4. `publicId.startsWith(expectedFolder + "/")` — le publicId ne peut pas
 *      trahir sa destination annoncée.
 *   5. Relecture Cloudinary (`readUploadedAssetMetadata`) — on confronte ce
 *      que Cloudinary dit réellement de l'asset avec ce que le client
 *      prétend. `publicId` et `secureUrl` doivent matcher.
 *
 * Les 5 étapes se font dans une transaction Prisma : si une seule échoue,
 * aucun `MediaAsset` n'est créé.
 *
 * Cas `new-discipline` :
 *   `MediaAsset.disciplineId` reste null, `proposedDisciplineName` porte
 *   le nom proposé. La validation admin créera la Discipline et remplira
 *   `disciplineId` dans un second temps.
 */

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
  destination: UploadDestination;
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
          message:
            "Asset folder does not match the authorized pending destination.",
        });
      }

      if (!asset.publicId.startsWith(`${expectedFolder}/`)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Asset publicId does not match the authorized pending destination.",
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
          disciplineId:
            destination.kind === "existing-discipline"
              ? destination.disciplineId
              : null,
          proposedDisciplineName:
            destination.kind === "new-discipline"
              ? destination.proposedDisciplineName
              : null,
          eventDate: eventDate ?? null,
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