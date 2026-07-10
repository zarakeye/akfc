import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { resolvePendingUploadFolder } from "@backend/modules/cloudinary/services/resolvePendingUploadFolder.service";
import type {
  UploadDestination,
  UploadAssetRequest,
} from "@contracts/cloudinary/upload.types";

export async function createUploadSignatures(params: {
  prisma: PrismaClient;
  appRoot: string;
  destination: UploadDestination;
  assets: UploadAssetRequest[];
  /** Si absent/false : signe `overwrite:false` → Cloudinary refuse d'écraser. */
  allowOverwrite?: boolean;
}) {
  const { prisma, appRoot, destination, assets, allowOverwrite } = params;

  const folder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const overwrite = allowOverwrite ?? false;

  // ─── Détection de conflit, AVANT tout upload ───────────────────────────
  //
  // Le `publicId` stocké en DB est le publicId COMPLET (Cloudinary préfixe
  // le public_id par le folder à l'upload : `folder/nom`). On calcule donc
  // les publicIds complets prospectifs et on regarde lesquels existent déjà,
  // en une seule requête.
  const fullPublicIdFor = (fileName: string) =>
    `${folder}/${fileName.replace(/\.[^/.]+$/, "")}`;

  const existing = await prisma.mediaAsset.findMany({
    where: { publicId: { in: assets.map((a) => fullPublicIdFor(a.fileName)) } },
    select: { publicId: true },
  });
  const existingSet = new Set(existing.map((e) => e.publicId));

  return assets.map((asset) => {
    const publicId = asset.fileName.replace(/\.[^/.]+$/, "");
    const fullPublicId = `${folder}/${publicId}`;

    // ⚠️ La signature Cloudinary couvre TOUS les params envoyés (hors
    // file/api_key/resource_type). On ajoute `overwrite` à la chaîne signée
    // (le tri alphabétique est garanti par `.sort()`), et le client DOIT
    // envoyer la même valeur en FormData.
    const toSign = {
      folder,
      overwrite,
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
      // Renvoyé au client : la valeur signée (à ré-émettre en FormData)…
      overwrite,
      // …et le signal de conflit (le client demandera confirmation avant
      // d'écraser un publicId déjà présent en DB).
      alreadyExists: existingSet.has(fullPublicId),
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* TYPE EXPORT PROPRE (inféré) */
/* -------------------------------------------------------------------------- */
export type CreateUploadSignaturesOutput = Awaited<
  ReturnType<typeof createUploadSignatures>
>;