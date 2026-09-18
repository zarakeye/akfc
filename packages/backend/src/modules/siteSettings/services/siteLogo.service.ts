import { PutObjectCommand } from "@aws-sdk/client-s3";

import {
  getR2Bucket,
  getR2Client,
} from "@backend/modules/storage/adapters/r2/client";

/**
 * Clé R2 RÉSERVÉE du logo du site. Hors préfixe applicatif (`AKFC/…`) donc
 * hors monde finder ; jamais un MediaAsset. Écrasée à chaque upload → URL
 * stable, invalidation par `?v=updatedAt` côté consommateur.
 */
export const SITE_LOGO_KEY = "system/logo.svg";

/** Écrit (écrase) le logo du site dans R2. */
export async function putSiteLogo(
  body: Buffer,
  contentType: string,
): Promise<void> {
  const s3 = getR2Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: SITE_LOGO_KEY,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}
