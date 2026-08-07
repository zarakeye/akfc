import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

import { resolvePendingUploadFolder } from "@backend/modules/cloudinary/services/resolvePendingUploadFolder.service";
import { countPersoImages } from "@backend/modules/media/services/countPersoImages.service";
import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";
import { buildUploadFileName } from "@backend/modules/storage/services/buildUploadFileName.service";
import type {
  UploadDestination,
  UploadAssetRequest,
} from "@contracts/cloudinary/upload.types";

export async function createUploadSignatures(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
  destination: UploadDestination;
  assets: UploadAssetRequest[];
  /** Si absent/false : signe `overwrite:false` → Cloudinary refuse d'écraser. */
  allowOverwrite?: boolean;
}) {
  const { prisma, appRoot, userId, destination, assets, allowOverwrite } = params;

  // Le dossier perso n'accepte que des images (comme les avatars).
  if (destination.kind === "perso") {
    const hasNonImage = assets.some((asset) => asset.mediaType !== "image");
    if (hasNonImage) {
      throw new Error("Le dossier perso n'accepte que des images.");
    }
  }

  const folder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
    userId,
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const overwrite = allowOverwrite ?? false;

  // ─── Détection de conflit, AVANT tout upload ───────────────────────────
  //
  // Le `publicId` stocké en DB est le publicId COMPLET (Cloudinary préfixe
  // le public_id par le folder à l'upload : `folder/nom`). On calcule donc
  // les publicIds complets prospectifs et on regarde lesquels existent déjà,
  // en une seule requête.
  // Base slugifiée — même règle que R2 (`buildUploadFileName`), donc clés
  // Cloudinary et R2 identiques et SÛRES (ni point, ni espace, ni parenthèse).
  // Retire à la source la classe de bugs livraison/renommage. Le nom humain
  // reste dans `originalFileName` / `displayName`, lus à l'affichage.
  const safeBaseName = (fileName: string) =>
    buildUploadFileName(fileName).replace(/\.[^/.]+$/, "");
  const fullPublicIdFor = (fileName: string) =>
    `${folder}/${safeBaseName(fileName)}`;

  const existing = await prisma.mediaAsset.findMany({
    where: { publicId: { in: assets.map((a) => fullPublicIdFor(a.fileName)) } },
    select: { publicId: true },
  });
  const existingSet = new Set(existing.map((e) => e.publicId));

  // ── Enforcement du quota perso (AVANT tout upload) ──
  // Approximation volontaire : les fichiers déjà présents dans le dossier
  // (écrasements) n'augmentent pas le total → on ne compte que le neuf.
  // L'approximation penche du côté permissif (jamais de faux blocage).
  if (destination.kind === "perso") {
    const { total } = await countPersoImages({ prisma, appRoot, userId });
    const newCount = assets.length - existing.length;
    if (total + newCount > PERSO_PHOTO_QUOTA) {
      throw new Error(
        `Quota d'images perso atteint (max ${PERSO_PHOTO_QUOTA}). ` +
          `Actuel : ${total}. Nouvelles demandées : ${Math.max(0, newCount)}.`,
      );
    }
  }

  return assets.map((asset) => {
    const publicId = safeBaseName(asset.fileName);
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