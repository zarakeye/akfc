import { S3Client } from "@aws-sdk/client-s3";

/**
 * Client S3 dédié au stockage média local (MinIO), pour la sandbox.
 *
 * Distinct du client R2 : MinIO exige `forcePathStyle: true` (URLs
 * `endpoint/bucket/key`), là où R2 accepte le virtual-host style. On garde donc
 * un client séparé pour ne pas altérer R2 en prod.
 *
 * Env lues paresseusement : tant que `STORAGE_DRIVER !== "local"`, ce module est
 * importé mais ses fonctions ne sont jamais appelées → aucune var requise en prod.
 */

let cached: S3Client | null = null;

function readEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Média local (MinIO) : env var manquante ${name}. Attendu : ` +
        `MEDIA_S3_ENDPOINT, MEDIA_S3_ACCESS_KEY_ID, MEDIA_S3_SECRET_ACCESS_KEY, MEDIA_S3_BUCKET.`,
    );
  }
  return v;
}

export function getMediaS3Client(): S3Client {
  if (cached) return cached;
  cached = new S3Client({
    region: "us-east-1",
    endpoint: readEnv("MEDIA_S3_ENDPOINT"),
    forcePathStyle: true,
    credentials: {
      accessKeyId: readEnv("MEDIA_S3_ACCESS_KEY_ID"),
      secretAccessKey: readEnv("MEDIA_S3_SECRET_ACCESS_KEY"),
    },
  });
  return cached;
}

export function getMediaBucket(): string {
  return readEnv("MEDIA_S3_BUCKET");
}
