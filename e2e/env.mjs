// @ts-check
/**
 * Environnement des tests de bout en bout — un seul endroit pour toutes les adresses.
 *
 * Tout est LOCAL et dédié aux tests : la base `akfc_e2e` du Postgres de développement
 * (docker-compose.dev.yml), le bucket `akfc-e2e` du MinIO de développement, la boîte Mailpit, et
 * une application construite à part (apps/web/.next-e2e) qui écoute sur le port 3100. Ni la base
 * de développement (`akfc_db`), ni `pnpm dev`, ni la production ne sont touchés : `assertLocal`
 * refuse de continuer si quelqu'un modifie ces valeurs vers autre chose qu'une machine locale.
 */

export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export const E2E_DB = {
  host: "127.0.0.1",
  port: 5435,
  user: "akfc",
  password: "akfc-dev",
  database: "akfc_e2e",
};
export const E2E_DATABASE_URL = `postgresql://${E2E_DB.user}:${E2E_DB.password}@${E2E_DB.host}:${E2E_DB.port}/${E2E_DB.database}?schema=public`;

export const E2E_STORAGE = {
  endpoint: "http://127.0.0.1:9200",
  accessKeyId: "akfc-dev",
  secretAccessKey: "akfc-dev-secret",
  bucket: "akfc-e2e",
};

/** API de Mailpit (docker-compose.dev.yml) : les e-mails envoyés par l'application y arrivent. */
export const MAILPIT_API = "http://127.0.0.1:8026/api/v1";

/** Variables de l'application de test : elles l'emportent sur apps/web/.env.local. */
export const E2E_APP_ENV = {
  AKFC_E2E: "1",
  NODE_ENV: "production",
  DATABASE_URL: E2E_DATABASE_URL,
  DIRECT_DATABASE_URL: E2E_DATABASE_URL,
  JWT_SECRET: "e2e-only-jwt-secret-0123456789-abcdefghijklmnopqrstuvwxyz",
  R2_ENDPOINT: E2E_STORAGE.endpoint,
  R2_ACCESS_KEY_ID: E2E_STORAGE.accessKeyId,
  R2_SECRET_ACCESS_KEY: E2E_STORAGE.secretAccessKey,
  R2_BUCKET: E2E_STORAGE.bucket,
  R2_FORCE_PATH_STYLE: "true",
  APP_FULL_NAME: "Association Kung Fu Chambéry (tests)",
  APP_SHORT_NAME: "AKFC",
  NEXT_PUBLIC_APP_SHORT_NAME: "AKFC",
  NEXTAUTH_URL: E2E_BASE_URL,
  NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
  APP_SUPPORT_EMAIL: "contact@e2e.test",
  SMTP_HOST: "127.0.0.1",
  SMTP_PORT: "1026",
  SMTP_USER: "dev",
  SMTP_PASSWORD: "dev",
  SMTP_FROM_NOREPLY: "noreply@e2e.test",
  SMTP_REPLY_TO: "",
  // Rien qui tourne seul pendant les tests : ni la relève des e-mails, ni le récapitulatif, ni la purge.
  TICKET_IMAP_HOST: "",
  TICKET_ARCHIVE_BCC: "",
  TICKET_RECAP_DISABLED: "1",
  RETENTION_PURGE_DISABLED: "1",
};

/** Garde-fou : la base et le stockage des tests sont locaux et dédiés, ou rien ne se lance. */
export function assertLocal() {
  const local = (/** @type {string} */ url) => /^(postgresql|http):\/\/([^@/]*@)?(127\.0\.0\.1|localhost):/.test(url);
  if (!local(E2E_DATABASE_URL) || E2E_DB.database !== "akfc_e2e") {
    throw new Error(`Base de test refusée : ${E2E_DB.host}/${E2E_DB.database} (attendu : 127.0.0.1, akfc_e2e).`);
  }
  if (!local(E2E_STORAGE.endpoint) || E2E_STORAGE.bucket !== "akfc-e2e") {
    throw new Error(`Stockage de test refusé : ${E2E_STORAGE.endpoint}/${E2E_STORAGE.bucket}.`);
  }
}
