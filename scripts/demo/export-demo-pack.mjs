#!/usr/bin/env node
// @ts-check
/**
 * Paquet de photos de la démo : extrait les photos de la bibliothèque LOCALE (aux visages
 * modifiés), sans rien d'autre, pour la démo en ligne.
 *
 *   node --env-file=.env scripts/demo/export-demo-pack.mjs
 *
 * Ce qui sort : demo-pack.tar.gz, à la racine du dépôt (ignoré par git), qui contient
 *   - les photos, réencodées en JPEG : orientation appliquée, 2048 px au plus de côté, et AUCUNE
 *     métadonnée (ni position GPS, ni appareil, ni date de prise de vue : sharp ne les recopie
 *     pas sans qu'on le lui demande) ;
 *   - manifest.json : pour chaque photo, son dossier dans la bibliothèque, ses dimensions, et un
 *     nom neutre (photo-0001.jpg) : un nom de fichier d'origine peut contenir le nom de quelqu'un.
 *
 * Ce qui ne sort pas : la base. Ni noms, ni comptes, ni descriptions, ni titres : le seed de la
 * démo fabrique son contenu, avec des personnes fictives. Ni l'espace personnel des instructeurs,
 * ni la corbeille.
 *
 * Il ne lit que la base et le stockage LOCAUX : la garde de prisma/db-target.mjs refuse toute
 * adresse distante, la production comprise. Il n'écrit rien, nulle part, sauf le paquet.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { assertLocalTarget } from "../../prisma/db-target.mjs";

// sharp est une dépendance du backend, pas de la racine : on le prend là où pnpm l'a installé.
/** @type {typeof import("sharp")} */
const sharp = createRequire(new URL("../../packages/backend/package.json", import.meta.url))("sharp");

const OUT_DIR = "demo-pack";
const OUT_FILE = "demo-pack.tar.gz";
const MAX_SIDE = 2048;
/** Ce que sharp sait décoder ; le reste (SVG, HEIC, vidéos…) n'entre pas dans le paquet. */
const RASTER = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/tiff"]);

const env = process.env;
for (const name of ["DATABASE_URL", "R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]) {
  if (!env[name]) throw new Error(`${name} manquante : lancer avec node --env-file=.env …`);
}
// Avant toute connexion : jamais la production, ni aucune autre machine.
assertLocalTarget(env.DATABASE_URL, "la base");
assertLocalTarget(env.R2_ENDPOINT, "le stockage");

const prisma = new PrismaClient();
const s3 = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  forcePathStyle: env.R2_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId: String(env.R2_ACCESS_KEY_ID), secretAccessKey: String(env.R2_SECRET_ACCESS_KEY) },
});

/** @param {string} key */
async function readObject(key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
  if (!res.Body) throw new Error("objet vide");
  return Buffer.from(await res.Body.transformToByteArray());
}

async function main() {
  const assets = await prisma.mediaAsset.findMany({
    where: { status: { not: "bin" }, mimeType: { startsWith: "image/" } },
    select: { fullPath: true, mimeType: true, appRoot: true },
    orderBy: { fullPath: "asc" },
  });
  // L'espace personnel (les photos des instructeurs) reste où il est.
  const kept = assets.filter(
    (a) => RASTER.has(a.mimeType) && !a.fullPath.startsWith(`${a.appRoot}/personal-space/`),
  );

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(path.join(OUT_DIR, "photos"), { recursive: true });

  /** @type {{ file: string; folder: string; width: number; height: number }[]} */
  const photos = [];
  let failed = 0;
  for (const asset of kept) {
    const name = `photo-${String(photos.length + 1).padStart(4, "0")}.jpg`;
    try {
      const { data, info } = await sharp(await readObject(asset.fullPath))
        .rotate()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
      writeFileSync(path.join(OUT_DIR, "photos", name), data);
      // Le dossier, relatif à la racine du stockage : le seed recrée la même bibliothèque.
      const relative = asset.fullPath.slice(asset.appRoot.length + 1);
      photos.push({ file: name, folder: path.posix.dirname(relative), width: info.width, height: info.height });
    } catch {
      failed += 1;
    }
  }

  writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    `${JSON.stringify({ version: 1, createdAt: new Date().toISOString(), photos }, null, 2)}\n`,
  );
  execFileSync("tar", ["-czf", OUT_FILE, "-C", OUT_DIR, "."]);
  rmSync(OUT_DIR, { recursive: true, force: true });

  const folders = new Set(photos.map((p) => p.folder)).size;
  const skipped = assets.length - kept.length;
  console.log(`✅ ${OUT_FILE} : ${photos.length} photos dans ${folders} dossiers`);
  if (skipped) console.log(`   ${skipped} écartées (espace personnel, ou format non photo : SVG, HEIC…)`);
  if (failed) console.log(`   ${failed} illisibles (objet absent du stockage, ou fichier abîmé)`);
  console.log(`   Avant de le publier : ouvrez-le et regardez-le (tar -xzf ${OUT_FILE} -C /tmp/demo-pack).`);
}

main()
  .catch((error) => {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
