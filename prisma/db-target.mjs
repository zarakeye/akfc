// @ts-check
import { pathToFileURL } from "node:url";

/**
 * Garde « pas la production depuis un poste de développement ».
 *
 * Une même configuration (.env) sert la CLI Prisma, le seed et `pnpm dev`. Un fichier copié du
 * serveur suffit pour qu'une migration, un seed ou le démarrage du site local écrivent dans la base
 * de production, sans un mot. Cette garde regarde OÙ mène l'adresse, et refuse ce qui sort de la
 * machine ou du réseau Docker :
 *   - accepté : 127.0.0.1, localhost, ::1 (la machine) ; un nom sans point (« postgres »,
 *     « pgbouncer », « db ») : un service du réseau Docker, celui du serveur ou de la sandbox ;
 *   - refusé : toute autre adresse IP ou tout nom de domaine.
 * AKFC_ALLOW_REMOTE_DB=1 lève le refus, pour une opération voulue (affiche un avertissement).
 *
 * Rangé dans prisma/ : l'étape migrator du Dockerfile copie ce dossier, la garde y suit prisma.config.ts.
 * Lancé seul (`node --env-file=.env prisma/db-target.mjs`), il vérifie DATABASE_URL et R2_ENDPOINT.
 */

/** @param {string} host */
function isLocalHost(host) {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || h === "::1" || /^127\.\d+\.\d+\.\d+$/.test(h)) return true;
  return !h.includes(".") && !h.includes(":") && h !== "";
}

/**
 * L'hôte d'une adresse (sans identifiants), ou null si l'adresse est vide ou illisible.
 * @param {string | undefined} url
 */
export function hostOf(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname || null;
  } catch {
    return null;
  }
}

/**
 * Lève une erreur si `url` mène hors de la machine ou du réseau Docker. Adresse vide : rien à
 * protéger (la construction de l'image génère le client Prisma sans base).
 * @param {string | undefined} url
 * @param {string} what  ce qui est protégé, pour le message (« la base », « le stockage »)
 */
export function assertLocalTarget(url, what) {
  const host = hostOf(url);
  if (!host || isLocalHost(host)) return;
  if (process.env.AKFC_ALLOW_REMOTE_DB === "1") {
    console.warn(`⚠ ${what} : adresse distante (${host}) autorisée par AKFC_ALLOW_REMOTE_DB=1`);
    return;
  }
  throw new Error(
    `${what} : adresse distante (${host}), refusée depuis un poste de développement.\n` +
      "  Le .env vise sans doute la production : remets la configuration locale (/docs/dev/demarrer/mise-en-route),\n" +
      "  ou, pour une opération voulue sur ce serveur : AKFC_ALLOW_REMOTE_DB=1.",
  );
}

// Lancé seul : vérifie la base et le stockage de l'environnement courant.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    assertLocalTarget(process.env.DATABASE_URL, "La base");
    assertLocalTarget(process.env.DIRECT_DATABASE_URL, "La base (connexion directe)");
    assertLocalTarget(process.env.R2_ENDPOINT, "Le stockage");
  } catch (err) {
    console.error(`❌ ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
