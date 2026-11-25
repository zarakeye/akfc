#!/usr/bin/env node
// @ts-check
/**
 * Paquet de photos de la démo : extrait les photos de la bibliothèque LOCALE (aux visages
 * modifiés), sans rien d'autre, pour la démo en ligne.
 *
 *   node --env-file=.env scripts/demo/export-demo-pack.mjs
 *
 * Ce qui sort : demo-pack.tar.gz, à la racine du dépôt (ignoré par git), qui contient
 *   - les photos de la bibliothèque et des espaces personnels, réencodées en JPEG : orientation
 *     appliquée, 2048 px au plus de côté, et AUCUNE métadonnée (ni position GPS, ni appareil, ni
 *     date de prise de vue : sharp ne les recopie pas sans qu'on le lui demande) ;
 *   - manifest.json : pour chaque photo, son chemin dans le stockage, relatif à la racine, et ses
 *     dimensions ; et ce qu'il faut au seed pour que ces chemins mènent quelque part : les
 *     catégories et les disciplines (leurs segments de dossier), les groupes à espace.
 *
 * Les chemins sont recopiés tels quels, sauf deux segments qui portent l'identifiant d'une ligne
 * de la base : `personal-space/<nom>-<id de l'utilisateur>` et
 * `collaborative-group-spaces/<nom>-<id du groupe>`. Ils deviennent `{perso-1}`, `{group-1}`… :
 * le seed crée des personnes fictives et des groupes, et met leurs identifiants à la place. Le
 * nom d'un instructeur, qui fait partie du segment de son espace, ne sort donc pas.
 *
 * Ce qui ne sort pas : le reste de la base (comptes, membres, descriptions, pages…), que le seed
 * fabrique ; les vidéos, dont les visages n'ont pas pu être modifiés ; les avatars ; la corbeille.
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

// sharp et slugify sont des dépendances du backend, pas de la racine : on les prend là où pnpm les
// a installés.
const backendRequire = createRequire(new URL("../../packages/backend/package.json", import.meta.url));
/** @type {typeof import("sharp")} */
const sharp = backendRequire("sharp");
/** @type {(input: string, options: { lower: boolean; strict: boolean }) => string} */
const slugify = backendRequire("slugify");
const slug = (/** @type {string} */ input) => slugify(input, { lower: true, strict: true });

const OUT_DIR = "demo-pack";
const OUT_FILE = "demo-pack.tar.gz";
const MAX_SIDE = 2048;
/** Ce que sharp sait décoder ; le reste (vidéos, SVG, HEIC…) n'entre pas dans le paquet. */
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

/** Segment `<nom>-<id>` d'un espace : l'identifiant de l'utilisateur ou du groupe, après le dernier tiret. */
const SPACE_SEGMENT = /^(?:.*-)?([^-]+)$/;

/**
 * Remplace, dans un chemin relatif, le segment d'espace par sa clé (`{perso-1}`, `{group-1}`).
 * @param {string} relative
 * @param {Map<string, string>} keys  cuid → clé, rempli au fil de l'export
 * @returns {{ path: string; space?: { kind: "perso" | "group"; id: string; key: string } }}
 */
function placeholderPath(relative, keys) {
  const parts = relative.split("/");
  const kind = parts[0] === "personal-space" ? "perso" : parts[0] === "collaborative-group-spaces" ? "group" : null;
  const match = kind && parts[1] ? SPACE_SEGMENT.exec(parts[1]) : null;
  if (!kind || !match) return { path: relative };
  const id = match[1];
  let key = keys.get(id);
  if (!key) {
    key = `${kind}-${[...keys.values()].filter((k) => k.startsWith(kind)).length + 1}`;
    keys.set(id, key);
  }
  parts[1] = `{${key}}`;
  return { path: parts.join("/"), space: { kind, id, key } };
}

/**
 * Nom du fichier dans le paquet : le nom d'origine, extension `.jpg` (réencodé), unique dans son
 * dossier (`a.png` et `a.jpg` côte à côte deviennent `a.jpg` et `a-2.jpg`).
 * @param {string} dir
 * @param {string} original
 * @param {Set<string>} taken
 */
function jpgName(dir, original, taken) {
  const base = path.posix.basename(original).replace(/\.[^.]+$/, "") || "photo";
  for (let n = 1; ; n += 1) {
    const name = n === 1 ? `${base}.jpg` : `${base}-${n}.jpg`;
    if (!taken.has(`${dir}/${name}`)) {
      taken.add(`${dir}/${name}`);
      return name;
    }
  }
}

async function main() {
  const assets = await prisma.mediaAsset.findMany({
    where: { status: { not: "bin" }, mimeType: { startsWith: "image/" } },
    select: { fullPath: true, mimeType: true, appRoot: true },
    orderBy: { fullPath: "asc" },
  });
  // Les avatars restent où ils sont : ce sont les visages des membres.
  const kept = assets.filter((a) => RASTER.has(a.mimeType) && !a.fullPath.startsWith(`${a.appRoot}/avatars/`));

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(path.join(OUT_DIR, "photos"), { recursive: true });

  /** @type {{ file: string; path: string; width: number; height: number }[]} */
  const photos = [];
  /** @type {Map<string, string>} */
  const spaceKeys = new Map();
  /** @type {Map<string, "perso" | "group">} */
  const spaceKinds = new Map();
  const takenNames = new Set();
  let failed = 0;
  for (const asset of kept) {
    const file = `photo-${String(photos.length + 1).padStart(4, "0")}.jpg`;
    try {
      const { data, info } = await sharp(await readObject(asset.fullPath))
        .rotate()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
      writeFileSync(path.join(OUT_DIR, "photos", file), data);
      // Relatif à la racine du stockage : le seed le replace sous la sienne, au même endroit.
      const { path: relative, space } = placeholderPath(asset.fullPath.slice(asset.appRoot.length + 1), spaceKeys);
      if (space) spaceKinds.set(space.id, space.kind);
      const dir = path.posix.dirname(relative);
      const name = jpgName(dir, relative, takenNames);
      photos.push({ file, path: `${dir}/${name}`, width: info.width, height: info.height });
    } catch {
      failed += 1;
    }
  }

  // Ce qu'il faut au seed pour que les chemins mènent quelque part. Les segments de dossier des
  // catégories et des disciplines sont des libellés publics du site, sans identifiant.
  // Une ligne ancienne n'a pas encore sa colonne : même calcul que storageSegments.ts.
  /** @param {{ type: string; storageSegment: string | null }} c */
  const categorySegment = (c) => c.storageSegment ?? (c.type === "Cours" ? "courses" : slug(c.type));
  const categories = (await prisma.category.findMany({ select: { type: true, key: true, storageSegment: true } })).map(
    (c) => ({ type: c.type, key: c.key, storageSegment: categorySegment(c) }),
  );
  const disciplines = (
    await prisma.discipline.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        storageSegment: true,
        category: { select: { type: true, storageSegment: true } },
      },
    })
  ).map((d) => ({
    name: d.name,
    type: d.type,
    storageSegment: d.storageSegment ?? (slug(d.name) || `disc-${d.id}`),
    category: categorySegment(d.category),
  }));
  // Les groupes à espace : leur nom suffit (« Bureau », « Instructeurs »…). Les espaces
  // personnels : rien d'autre que leur clé, le seed leur donne une personne fictive.
  const groupIds = [...spaceKinds].filter(([, kind]) => kind === "group").map(([id]) => id);
  const groupNames = new Map(
    (await prisma.memberGroup.findMany({ where: { id: { in: groupIds } }, select: { id: true, name: true } })).map(
      (g) => [g.id, g.name],
    ),
  );
  const spaces = [...spaceKinds].map(([id, kind]) => ({
    key: spaceKeys.get(id),
    kind,
    ...(kind === "group" ? { name: groupNames.get(id) ?? "Groupe" } : {}),
  }));

  writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    `${JSON.stringify({ version: 2, createdAt: new Date().toISOString(), categories, disciplines, spaces, photos }, null, 2)}\n`,
  );
  execFileSync("tar", ["-czf", OUT_FILE, "-C", OUT_DIR, "."]);
  rmSync(OUT_DIR, { recursive: true, force: true });

  const folders = new Set(photos.map((p) => path.posix.dirname(p.path))).size;
  const skipped = assets.length - kept.length;
  console.log(`✅ ${OUT_FILE} : ${photos.length} photos dans ${folders} dossiers, ${spaces.length} espaces`);
  if (skipped) console.log(`   ${skipped} écartées (avatars, ou format non photo : SVG, HEIC…)`);
  if (failed) console.log(`   ${failed} illisibles (objet absent du stockage, ou fichier abîmé)`);
  console.log(`   Avant de le publier : ouvrez-le et regardez-le (tar -xzf ${OUT_FILE} -C /tmp/demo-pack).`);
}

main()
  .catch((error) => {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
