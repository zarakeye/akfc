import { S3Client } from "@aws-sdk/client-s3";

/**
 * client.ts — singleton S3 Client configuré pour Cloudflare R2.
 *
 * R2 est S3-compatible : on utilise donc le SDK `@aws-sdk/client-s3` standard
 * en pointant son `endpoint` vers le S3 API endpoint de Cloudflare et en
 * forçant `region` à `"auto"`.
 *
 * ─── Pourquoi un singleton ? ─────────────────────────────────────────────
 *
 * Le S3Client maintient un pool de connexions HTTP keep-alive. Recréer un
 * client à chaque appel jetterait les connexions et coûterait de la latence
 * (handshake TLS + DNS à chaque fois). Un singleton réutilise les sockets,
 * c'est strictement plus efficace.
 *
 * Pas de problème de concurrence : le S3Client est conçu pour être partagé
 * entre requêtes concurrentes.
 *
 * ─── Pourquoi `region: "auto"` ? ──────────────────────────────────────────
 *
 * R2 ne segmente pas son storage en régions de la même façon qu'AWS S3 (il
 * est global avec une localisation principale par bucket). La valeur `"auto"`
 * dit au SDK de ne pas inclure de header de region — Cloudflare se débrouille.
 *
 * Si on mettait par exemple `"eu-west-1"`, AWS SDK le mettrait dans les
 * signatures et R2 refuserait les requêtes. `"auto"` est la valeur sûre.
 */

let cached: S3Client | null = null;

function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `R2 env var manquante : ${name}. ` +
        `Vérifie ton .env.local — toutes les vars R2_* doivent être définies ` +
        `(R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT).`
    );
  }
  return value;
}

export function getR2Client(): S3Client {
  if (cached) return cached;

  cached = new S3Client({
    region: "auto",
    endpoint: readEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: readEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: readEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return cached;
}

export function getR2Bucket(): string {
  return readEnv("R2_BUCKET");
}

/**
 * Utilitaire pour les tests / dev : reset le singleton pour forcer une
 * recréation au prochain appel. Utile si on veut changer les credentials
 * à chaud (rare).
 */
export function __resetR2ClientForTesting(): void {
  cached = null;
}
