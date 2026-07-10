import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { assertResourceTypeMatchesMimeType } from "@backend/modules/cloudinary/utils/media-validation.utils";
import { assertSafeCloudinaryPath } from "@backend/modules/cloudinary/utils/path-validation.utils";
import { readUploadedAssetMetadata } from "@backend/modules/cloudinary/services/readUploadedAssetMetadata.service";
import { resolvePendingUploadFolder } from "@backend/modules/cloudinary/services/resolvePendingUploadFolder.service";
import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";

/**
 * registerUploadedAssets.service.ts
 *
 * Enregistre en DB des assets fraîchement uploadés sur Cloudinary.
 * (Voir l'en-tête historique pour la chaîne de vérifications 1→5.)
 *
 * ─── Source de vérité : Cloudinary, pas le client ───────────────────────────
 *
 * Tous les champs dérivés du binaire sont relus depuis Cloudinary via
 * `readUploadedAssetMetadata` : publicId, assetId, secureUrl, resourceType,
 * format, bytes, dimensions, duration, ET le mimeType (désormais dérivé de
 * resourceType + format côté Cloudinary). On ne fait PLUS confiance au
 * `asset.mimeType` envoyé par le client — c'est ce qui produisait des lignes
 * aberrantes `image/mp4` (un .mp4 déclaré image par le client).
 *
 * ─── Idempotence (ré-upload / écrasement) ──────────────────────────────────
 *
 * `upsert` clé sur `publicId` :
 *   - asset neuf      → branche `create` (row complète).
 *   - asset réuploadé → branche `update`, qui rafraîchit UNIQUEMENT les
 *     champs dérivés du binaire (secureUrl, dimensions, bytes, fullPath,
 *     resourceType, mimeType…) et PRÉSERVE la curation (status, displayName,
 *     description, catégorie, discipline, uploader d'origine).
 *
 * Le chemin "écraser" n'est atteint que si le client a obtenu une signature
 * `overwrite:true` après confirmation explicite de l'utilisateur — sinon
 * Cloudinary aurait refusé l'écrasement en amont (`overwrite:false` signé).
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

      // Garde-fou d'entrée : cohérence resourceType/mimeType déclarés par le
      // client. Note : la vérité retenue en base vient de Cloudinary
      // (cloudinaryAsset.*), pas de ces valeurs.
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

      const fullPath = `${cloudinaryAsset.publicId}${
        cloudinaryAsset.format ? "." + cloudinaryAsset.format : ""
      }`;

      const createdAsset = await tx.mediaAsset.upsert({
        where: { publicId: cloudinaryAsset.publicId },
        create: {
          publicId: cloudinaryAsset.publicId,
          cloudinaryAssetId: cloudinaryAsset.assetId,
          secureUrl: cloudinaryAsset.secureUrl,
          resourceType: cloudinaryAsset.resourceType,
          // mimeType dérivé de Cloudinary, pas du client.
          mimeType: cloudinaryAsset.mimeType,
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
          fullPath,
        },
        update: {
          // On rafraîchit ce que le ré-upload change réellement…
          secureUrl: cloudinaryAsset.secureUrl,
          cloudinaryAssetId: cloudinaryAsset.assetId,
          resourceType: cloudinaryAsset.resourceType,
          // mimeType dérivé de Cloudinary, pas du client.
          mimeType: cloudinaryAsset.mimeType,
          format: cloudinaryAsset.format,
          bytes: cloudinaryAsset.bytes,
          width: cloudinaryAsset.width,
          height: cloudinaryAsset.height,
          duration: cloudinaryAsset.duration,
          fullPath,
          // …et on NE touche PAS : status, displayName, description,
          // categoryId, disciplineId, eventDate, uploaderUserId
          // (curation préservée).
        },
      });

      out.push(createdAsset);
    }

    return out;
  });

  invalidateResourcesCache();

  return {
    success: true as const,
    assets: created.map((asset) => ({
      id: asset.id,
      publicId: asset.publicId,
      secureUrl: asset.secureUrl,
    })),
  };
}