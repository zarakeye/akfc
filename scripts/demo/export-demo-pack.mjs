#!/usr/bin/env node
// @ts-check
/**
 * Paquet de photos de la démo : extrait de la version LOCALE (photos aux visages modifiés) ce que
 * la démo en ligne reprend, et rien d'autre.
 *
 *   pnpm demo:pack      (node --env-file=.env scripts/demo/export-demo-pack.mjs)
 *
 * Ce qui sort : demo-data/demo-pack.tar.gz (ignoré par git, monté dans le seeder de la sandbox), qui contient
 *   - les photos de la bibliothèque, des espaces personnels et des avatars, réencodées en JPEG :
 *     orientation appliquée, 2048 px au plus de côté, et AUCUNE métadonnée (ni position GPS, ni
 *     appareil, ni date de prise de vue : sharp ne les recopie pas sans qu'on le lui demande) ;
 *   - manifest.json :
 *       photos       chaque photo, son chemin dans le stockage (relatif à la racine), ses dimensions ;
 *       avatars      la photo de chaque personne qui en a une ;
 *       bios         chaque bio d'instructeur, ses noms remplacés (voir plus bas) ;
 *       persons      les personnes à créer, sans nom : le seed leur en invente un ;
 *       spaces       les groupes à espace, avec leur nom (« Bureau »…) ;
 *       categories, disciplines   leurs segments de dossier, pour que les chemins mènent quelque part ;
 *                    les disciplines avec leur famille, leur origine, leur instructeur (une personne
 *                    du paquet), leur publication, leur description et leur résumé ;
 *       families, origins         les familles (« Kung-fu wushu ») et origines des disciplines ;
 *       galleries    les galeries et leurs photos (le carousel d'accueil compris) ; une galerie sans
 *                    aucune photo du paquet (que des vidéos) n'est pas reprise ;
 *       partners     les partenaires du pied de page (la MJC, la FFK), logo compris.
 *
 * Les chemins sont recopiés tels quels, sauf les segments qui portent l'identifiant d'une ligne de
 * la base : `personal-space/<nom>-<id>`, `avatars/<id>` et `collaborative-group-spaces/<nom>-<id>`.
 * Ils deviennent `{person-1}`, `{group-1}`… : le seed crée des personnes fictives et des groupes,
 * et met leurs identifiants à la place. Une même personne garde la même clé partout : son espace,
 * son avatar et sa bio vont à la même personne fictive.
 *
 * Les bios, et de même les descriptions des disciplines et les titres des galeries :
 *   - le nom d'un instructeur (prénom, nom, pseudo) devient `{person-1.firstName}`,
 *     `{person-1.lastName}`, `{person-1.pseudo}` : le seed y met le nom de la personne fictive ;
 *   - les AUTRES noms de personnes se remplacent par scripts/demo/names.local.json (ignoré par git,
 *     { "Vrai Nom": "Nom fictif", … }). S'il n'existe pas, le premier lancement le REMPLIT : il
 *     repère les noms dans les bios (des mots à majuscule, hors début de phrase, hors disciplines,
 *     lieux et mots courants), leur invente des noms fictifs cohérents (« Paul Durand » →
 *     « Hugo Lefort », puis « Durand » seul → « Lefort ») et les applique. On relit ce fichier,
 *     on retire ce qui n'est pas une personne, on relance. Le fichier ne quitte pas le Mac ;
 *   - une image de la bio pointe vers sa photo dans le paquet (`media:<chemin>`), pas vers un
 *     identifiant de la base. Une image absente du paquet (une vidéo) est retirée.
 *
 * Ce qui ne sort pas : le reste de la base (comptes, membres, stages, pages…), que le seed
 * fabrique ; les vidéos, dont les visages n'ont pas pu être modifiés ; la corbeille.
 *
 * Il ne lit que la base et le stockage LOCAUX : la garde de prisma/db-target.mjs refuse toute
 * adresse distante, la production comprise. Il n'écrit rien, nulle part, sauf le paquet.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Prisma, PrismaClient } from "@prisma/client";
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
const OUT_FILE = "demo-data/demo-pack.tar.gz";
const NAMES_FILE = "scripts/demo/names.local.json";
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

/** @param {Buffer} input */
function toJpeg(input) {
  return sharp(input)
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
}

/** Clés des personnes et des groupes : une ligne de la base, une clé, partout la même. */
const keys = { person: new Map(), group: new Map() };
/** @param {"person" | "group"} kind @param {string} id */
function keyOf(kind, id) {
  let key = keys[kind].get(id);
  if (!key) {
    key = `${kind}-${keys[kind].size + 1}`;
    keys[kind].set(id, key);
  }
  return key;
}

/** Identifiant d'un segment `<nom>-<id>` : ce qui suit le dernier tiret. */
const idOfSegment = (/** @type {string} */ segment) => segment.slice(segment.lastIndexOf("-") + 1);

/**
 * Chemin relatif à la racine, segments d'identifiant remplacés par leur clé.
 * @param {string} relative
 */
function placeholderPath(relative) {
  const parts = relative.split("/");
  if (parts.length < 3) return relative;
  if (parts[0] === "personal-space") parts[1] = `{${keyOf("person", idOfSegment(parts[1]))}}`;
  else if (parts[0] === "collaborative-group-spaces") parts[1] = `{${keyOf("group", idOfSegment(parts[1]))}}`;
  else if (parts[0] === "avatars") parts[1] = `{${keyOf("person", parts[1])}}`;
  return parts.join("/");
}

/**
 * Le nom d'origine, extension `.jpg` (réencodé), unique dans son dossier (`a.png` et `a.jpg` côte
 * à côte deviennent `a.jpg` et `a-2.jpg`).
 * @param {string} relative  chemin, clés déjà posées
 * @param {Set<string>} taken
 */
function jpgPath(relative, taken) {
  const dir = path.posix.dirname(relative);
  const base = path.posix.basename(relative).replace(/\.[^.]+$/, "") || "photo";
  for (let n = 1; ; n += 1) {
    const candidate = `${dir}/${n === 1 ? base : `${base}-${n}`}.jpg`;
    if (!taken.has(candidate)) {
      taken.add(candidate);
      return candidate;
    }
  }
}

/** Prénoms et noms fictifs, attribués dans l'ordre : un même vrai nom reçoit toujours le même. */
const FICTIONAL_FIRST = ["Camille", "Hugo", "Léa", "Théo", "Inès", "Nathan", "Manon", "Lucas", "Chloé", "Mathis", "Jade",
  "Enzo", "Sarah", "Noah", "Zoé", "Raphaël", "Lina", "Gabin", "Eva", "Jules", "Alice", "Louis", "Margaux", "Sacha",
  "Clara", "Arthur", "Romane", "Tom", "Anaïs", "Maxime"];
const FICTIONAL_LAST = ["Roche", "Lefort", "Vasseur", "Marchal", "Berthier", "Coudray", "Ferrand", "Delmas", "Garnier",
  "Royer", "Fontaine", "Paillard", "Leclerc", "Duquesne", "Mercadier", "Tissot", "Courtois", "Lemaire", "Perrot",
  "Bastide", "Morvan", "Chabert", "Renaud", "Vidal", "Fournel", "Joubert", "Lacombe", "Rivière", "Ducros", "Albrand"];
/** Mots à majuscule qui ne sont pas des personnes (le reste se relit dans names.local.json). */
const NOT_NAMES = new Set(
  ("le la les un une des de du au aux en et il elle ils elles on nous vous son sa ses leur leurs ce cette ces " +
    "depuis avec pour dans sur sous chez après avant pendant entre puis aujourd'hui ensuite enfin passionné " +
    "passionnée kung fu sifu sigung maître maîtresse grand style école club association fédération france " +
    "savoie chambéry lyon paris chine hong kong japon taïwan asie europe mjc ffk janvier février mars avril " +
    "mai juin juillet août septembre octobre novembre décembre lundi mardi mercredi jeudi vendredi samedi dimanche " +
    // Styles et arts martiaux : les disciplines de la base s'ajoutent à cette liste.
    "hung gar wing chun tsun choy tchoy lee fut tai chi chuan qi gong shaolin wudang kali arnis eskrima escrima " +
    "jeet kune do bak mei mantis")
    .split(" "),
);

const TITLES = /(?:sifu|sigung|maître|maîtresse|m\.|mme|mr|monsieur|madame)\s+$/i;

/**
 * Repère les noms de personnes probables dans des textes : suites de un à trois mots à majuscule
 * (le reste en minuscules : les sigles comme FFK n'en sont pas), hors début de phrase pour un mot
 * seul, hors mots qui apparaissent aussi en minuscules, hors mots connus (NOT_NAMES, disciplines…).
 * @param {string[]} texts
 * @param {Set<string>} known  mots à ne jamais prendre pour un nom (en minuscules)
 */
function detectNames(texts, known) {
  const lowerWords = new Set(texts.flatMap((t) => t.match(/(?<![\p{L}])\p{Ll}[\p{L}'’-]*/gu) ?? []));
  const isName = (/** @type {string} */ w) => !NOT_NAMES.has(w.toLowerCase()) && !known.has(w.toLowerCase()) && !lowerWords.has(w.toLowerCase());
  /** @type {Set<string>} */
  const found = new Set();
  for (const text of texts) {
    // Un mot composé (« Jean-Marc ») reste un seul mot.
    // Un mot : « Paul », « Jean-Marc », ou un nom de famille en capitales (« DURAND »).
    const word = "(?:\\p{Lu}\\p{Ll}[\\p{L}'’]*(?:-\\p{Lu}\\p{Ll}[\\p{L}'’]*)*|\\p{Lu}{2,}(?:-\\p{Lu}{2,})*)";
    for (const m of text.matchAll(new RegExp(`(?<![\\p{L}\\p{N}{-])${word}(?: ${word}){0,2}(?![\\p{L}\\p{N}])`, "gu"))) {
      const before = text.slice(0, m.index ?? 0);
      // Des capitales seules sont un sigle (« FFK », « BPJEPS ») ; à côté d'un prénom, ou après un
      // titre, un nom de famille.
      const caps = (/** @type {string} */ w) => /^[\p{Lu}-]+$/u.test(w);
      const mixed = m[0].split(" ").some((w) => !caps(w));
      const words = m[0].split(" ").filter((w) => isName(w) && (!caps(w) || mixed || TITLES.test(before)));
      if (words.length === 0) continue;
      const sentenceStart = /(^|[.!?:;]\s*|\n\s*)$/.test(before);
      if (words.length === 1 && sentenceStart) continue;
      // Un mot seul après un titre (« Sifu Lam », « M. Chen ») est un nom de famille ; sinon, un prénom.
      const raw = m[0].split(" ");
      const titled =
        TITLES.test(before) || (raw.length > words.length && TITLES.test(`${raw.slice(0, raw.length - words.length).join(" ")} `));
      found.add(words.length === 1 && titled ? `|${words[0]}` : words.join(" "));
    }
  }
  // Les noms complets d'abord : leurs parties seules suivent le même nom fictif.
  return [...found].sort((a, b) => b.split(" ").length - a.split(" ").length);
}

/**
 * Invente des noms fictifs pour des noms repérés, de façon cohérente : « Paul Durand » →
 * « Hugo Lefort », et ensuite « Durand » seul → « Lefort », « Paul » seul → « Hugo ».
 * @param {string[]} detected  noms complets d'abord
 * @returns {Record<string, string>}
 */
function inventNames(detected) {
  /** @type {Record<string, string>} */
  const map = {};
  let first = 0;
  let last = 0;
  const pick = (/** @type {string[]} */ pool, /** @type {number} */ i) => pool[i % pool.length] + (i >= pool.length ? ` ${Math.floor(i / pool.length) + 1}` : "");
  for (const entry of detected) {
    // « |Lam » : un nom de famille seul (après un titre) ; un mot seul sans titre : un prénom.
    const family = entry.startsWith("|");
    const name = family ? entry.slice(1) : entry;
    if (map[name]) continue;
    const words = name.split(" ");
    if (words.length === 1) {
      map[name] = family ? pick(FICTIONAL_LAST, last++) : pick(FICTIONAL_FIRST, first++);
      continue;
    }
    const [given, ...rest] = words;
    const familyName = rest.join(" ");
    const fictiveGiven = map[given] ?? pick(FICTIONAL_FIRST, first++);
    const fictiveFamily = map[familyName] ?? pick(FICTIONAL_LAST, last++);
    map[name] = `${fictiveGiven} ${fictiveFamily}`;
    map[given] ??= fictiveGiven;
    map[familyName] ??= fictiveFamily;
  }
  return map;
}

/** @param {string} s */
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Remplace des noms, mots entiers, sans tenir compte de la casse ; les plus longs d'abord, pour
 * que « Jean Dupont » passe avant « Jean ».
 * @param {string} text
 * @param {[string, string][]} pairs
 */
function replaceNames(text, pairs) {
  let out = text;
  for (const [from, to] of [...pairs].sort((a, b) => b[0].length - a[0].length)) {
    if (!from.trim()) continue;
    out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}{])${escapeRegExp(from)}(?![\\p{L}\\p{N}}])`, "giu"), to);
  }
  return out;
}

/**
 * Parcourt une bio (contenu de builder, JSON) : noms remplacés dans chaque texte, images
 * rattachées à leur photo du paquet, avatars à leur personne (`person:<clé>`). Rend null pour un
 * objet qui pointe vers une image absente ; dans un objet, la clé qui le portait disparaît.
 * @param {unknown} node
 * @param {(text: string) => string} rename
 * @param {Map<string, string>} mediaPaths  id du média → chemin dans le paquet
 * @returns {unknown}
 */
function transformBio(node, rename, mediaPaths) {
  if (typeof node === "string") return rename(node);
  if (Array.isArray(node)) {
    return node.map((n) => transformBio(n, rename, mediaPaths)).filter((n) => n !== null);
  }
  if (node && typeof node === "object") {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "mediaId" && typeof v === "string") {
        const packPath = mediaPaths.get(v);
        if (!packPath) return null;
        out[k] = `media:${packPath}`;
      } else if (k === "userId" && typeof v === "string" && /** @type {{ kind?: unknown }} */ (node).kind === "avatar") {
        out[k] = `person:${keyOf("person", v)}`;
      } else {
        const t = transformBio(v, rename, mediaPaths);
        if (t === null && v !== null) continue;
        out[k] = t;
      }
    }
    return out;
  }
  return node;
}

/**
 * Les mots à majuscule d'une bio, sauf ceux des noms fictifs déjà mis : ce qui reste est peut-être
 * un nom réel oublié.
 * @param {unknown} node @param {Set<string>} words @param {Set<string>} fictional
 */
function collectCapitalized(node, words, fictional) {
  if (typeof node === "string") {
    if (node.startsWith("media:")) return;
    for (const m of node.matchAll(/(?<![\p{L}\p{N}{.])\p{Lu}[\p{L}'-]+/gu)) {
      if (!fictional.has(m[0].toLowerCase()) && !NOT_NAMES.has(m[0].toLowerCase())) words.add(m[0]);
    }
  } else if (Array.isArray(node)) node.forEach((n) => collectCapitalized(n, words, fictional));
  else if (node && typeof node === "object") Object.values(node).forEach((v) => collectCapitalized(v, words, fictional));
}

async function main() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(path.join(OUT_DIR, "photos"), { recursive: true });
  const taken = new Set();
  let failed = 0;
  /** La cause du premier échec (code d'erreur seulement : pas de chemin, qui peut porter un nom). */
  let firstError = "";
  const fail = (/** @type {unknown} */ error) => {
    failed += 1;
    if (!firstError) {
      const e = /** @type {{ name?: string; code?: string; Code?: string; message?: string }} */ (error);
      firstError = e?.Code ?? e?.code ?? e?.name ?? "erreur";
    }
  };
  let n = 0;
  const nextFile = () => `photo-${String(++n).padStart(4, "0")}.jpg`;

  // 1. Les photos : bibliothèque, espaces personnels, espaces de groupe.
  const assets = await prisma.mediaAsset.findMany({
    where: { status: { not: "bin" }, mimeType: { startsWith: "image/" } },
    select: { id: true, fullPath: true, mimeType: true, appRoot: true },
    orderBy: { fullPath: "asc" },
  });
  /** @type {{ file: string; path: string; width: number; height: number }[]} */
  const photos = [];
  /** @type {Map<string, string>} */
  const mediaPaths = new Map();
  for (const asset of assets) {
    if (!RASTER.has(asset.mimeType)) continue;
    try {
      const { data, info } = await toJpeg(await readObject(asset.fullPath));
      const file = nextFile();
      writeFileSync(path.join(OUT_DIR, "photos", file), data);
      const packPath = jpgPath(placeholderPath(asset.fullPath.slice(asset.appRoot.length + 1)), taken);
      photos.push({ file, path: packPath, width: info.width, height: info.height });
      mediaPaths.set(asset.id, packPath);
    } catch (error) {
      fail(error);
    }
  }

  // 2. Les avatars : `<racine>/avatars/<id du membre>/<fichier>`, hors bibliothèque.
  const withAvatar = await prisma.user.findMany({
    where: { avatar: { not: null } },
    select: { id: true, avatar: true },
  });
  /** @type {{ person: string; file: string; path: string }[]} */
  const avatars = [];
  for (const user of withAvatar) {
    const key = String(user.avatar);
    try {
      const { data } = await toJpeg(await readObject(key));
      const file = nextFile();
      writeFileSync(path.join(OUT_DIR, "photos", file), data);
      const person = keyOf("person", user.id);
      avatars.push({ person, file, path: jpgPath(`avatars/{${person}}/${path.posix.basename(key)}`, taken) });
    } catch (error) {
      fail(error);
    }
  }

  // 3. Les bios d'instructeur, noms remplacés.
  // Un instructeur : il a une bio, ou il enseigne une discipline.
  const disciplineRows = await prisma.discipline.findMany({
    select: {
      id: true, name: true, type: true, slug: true, storageSegment: true, publicationDate: true,
      school: true, classification: true, description: true, summary: true, summaryMediaId: true,
      instructorId: true,
      family: { select: { slug: true } },
      origin: { select: { slug: true } },
      category: { select: { type: true, storageSegment: true } },
    },
    orderBy: { id: "asc" },
  });
  const instructors = await prisma.user.findMany({
    where: {
      OR: [
        { NOT: { instructorBio: { equals: Prisma.DbNull } } },
        { id: { in: disciplineRows.map((d) => d.instructorId) } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, pseudo: true, instructorBio: true, instructorOrder: true },
  });
  const galleryRows = await prisma.gallery.findMany({
    select: {
      slug: true, title: true, visibility: true, sortOrder: true, date: true,
      discipline: { select: { storageSegment: true, name: true, id: true, category: { select: { type: true, storageSegment: true } } } },
      category: { select: { type: true, storageSegment: true } },
      origin: { select: { slug: true } },
      items: { select: { mediaAssetId: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
  /** @param {(typeof instructors)[number]} u @param {string} person @returns {[string, string][]} */
  const ownNames = (u, person) => [
    [[u.firstName, u.lastName].filter(Boolean).join(" "), `{${person}.firstName} {${person}.lastName}`],
    [u.firstName ?? "", `{${person}.firstName}`],
    [u.lastName ?? "", `{${person}.lastName}`],
    [u.pseudo ?? "", `{${person}.pseudo}`],
  ];
  let suggested = 0;
  if (!existsSync(NAMES_FILE)) {
    // Premier lancement : on repère les noms des AUTRES personnes (celui de l'instructeur est
    // déjà remplacé), on leur invente des noms fictifs, et le fichier se relit ensuite.
    /** @type {string[]} */
    const texts = [];
    const collect = (/** @type {unknown} */ node) => {
      if (typeof node === "string") texts.push(node);
      else if (Array.isArray(node)) node.forEach(collect);
      else if (node && typeof node === "object") Object.values(node).forEach(collect);
    };
    const allOwn = instructors.flatMap((u) => ownNames(u, "x"));
    for (const u of instructors) {
      collect(transformBio(u.instructorBio, (text) => replaceNames(text, allOwn), new Map()));
    }
    for (const d of disciplineRows) {
      collect(transformBio([d.description, d.summary], (text) => replaceNames(text, allOwn), new Map()));
    }
    for (const g of galleryRows) texts.push(replaceNames(g.title, allOwn));
    const known = new Set(
      [
        ...(await prisma.discipline.findMany({ select: { name: true } })).map((d) => d.name),
        ...(await prisma.category.findMany({ select: { type: true } })).map((c) => c.type),
      ].flatMap((label) => label.toLowerCase().split(/[\s'’()-]+/)),
    );
    const invented = inventNames(detectNames(texts, known));
    suggested = Object.keys(invented).length;
    writeFileSync(NAMES_FILE, `${JSON.stringify(invented, null, 2)}\n`);
  }
  /** @type {[string, string][]} */
  const others = Object.entries(JSON.parse(readFileSync(NAMES_FILE, "utf8")));
  const fictional = new Set(others.flatMap(([, to]) => to.toLowerCase().split(/[\s-]+/)));
  /** @type {{ person: string; order: number | null; content: unknown }[]} */
  const bios = [];
  const leftovers = new Set();
  // Les noms de TOUS les instructeurs : une description cite volontiers un autre instructeur.
  const allOwnNames = instructors.flatMap((u) => ownNames(u, keyOf("person", u.id)));
  const rename = (/** @type {string} */ text) => replaceNames(text, [...allOwnNames, ...others]);
  for (const u of instructors) {
    if (u.instructorBio === null) continue;
    const person = keyOf("person", u.id);
    const content = transformBio(u.instructorBio, rename, mediaPaths);
    collectCapitalized(content, leftovers, fictional);
    bios.push({ person, order: u.instructorOrder, content });
  }

  // 4. Ce qu'il faut au seed pour que les chemins mènent quelque part. Les segments de dossier
  // des catégories et des disciplines sont des libellés publics du site, sans identifiant ; une
  // ligne ancienne sans colonne suit le même calcul que storageSegments.ts.
  /** @param {{ type: string; storageSegment: string | null }} c */
  const categorySegment = (c) => c.storageSegment ?? (c.type === "Cours" ? "courses" : slug(c.type));
  const categories = (await prisma.category.findMany({ select: { type: true, key: true, storageSegment: true } })).map(
    (c) => ({ type: c.type, key: c.key, storageSegment: categorySegment(c) }),
  );
  /** @param {{ id: number; name: string; storageSegment: string | null }} d */
  const disciplineSegment = (d) => d.storageSegment ?? (slug(d.name) || `disc-${d.id}`);
  const disciplines = disciplineRows.map((d) => {
    const description = transformBio(d.description, rename, mediaPaths) ?? { version: 1, blocks: [] };
    const summary = transformBio(d.summary, rename, mediaPaths) ?? { version: 1, blocks: [] };
    collectCapitalized([description, summary], leftovers, fictional);
    const summaryMedia = d.summaryMediaId ? mediaPaths.get(d.summaryMediaId) : undefined;
    return {
      name: d.name,
      type: d.type,
      slug: d.slug,
      storageSegment: disciplineSegment(d),
      category: categorySegment(d.category),
      family: d.family?.slug ?? null,
      origin: d.origin?.slug ?? null,
      school: d.school,
      classification: d.classification,
      published: d.publicationDate !== null,
      instructor: keyOf("person", d.instructorId),
      description,
      summary,
      summaryMedia: summaryMedia ? `media:${summaryMedia}` : null,
    };
  });
  const families = await prisma.disciplineFamily.findMany({
    select: { name: true, slug: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });
  const origins = await prisma.origin.findMany({ select: { name: true, slug: true, description: true } });

  // Les galeries : seulement leurs photos du paquet ; une galerie qui n'en garde aucune est laissée.
  const galleries = [];
  for (const g of galleryRows) {
    const items = g.items.map((i) => mediaPaths.get(i.mediaAssetId)).filter((p) => p !== undefined);
    if (items.length === 0) continue;
    const title = rename(g.title);
    collectCapitalized(title, leftovers, fictional);
    galleries.push({
      slug: g.slug,
      title,
      visibility: g.visibility,
      sortOrder: g.sortOrder,
      date: g.date?.toISOString() ?? null,
      discipline: g.discipline
        ? { category: categorySegment(g.discipline.category), storageSegment: disciplineSegment(g.discipline) }
        : null,
      category: g.category ? categorySegment(g.category) : null,
      origin: g.origin?.slug ?? null,
      items: items.map((p) => `media:${p}`),
    });
  }

  // Les partenaires du pied de page : des organismes (la MJC, la FFK), pas des personnes.
  const partners = (
    await prisma.sitePartner.findMany({
      select: {
        name: true, role: true, description: true, websiteUrl: true, links: true,
        logoData: true, logoMime: true, position: true, isActive: true,
      },
      orderBy: { position: "asc" },
    })
  ).map((p) => ({ ...p, logoData: p.logoData ? Buffer.from(p.logoData).toString("base64") : null }));
  const groupNames = new Map(
    (
      await prisma.memberGroup.findMany({ where: { id: { in: [...keys.group.keys()] } }, select: { id: true, name: true } })
    ).map((g) => [g.id, g.name]),
  );
  const spaces = [...keys.group].map(([id, key]) => ({ key, kind: "group", name: groupNames.get(id) ?? "Groupe" }));
  const persons = [...keys.person.values()].map((key) => ({
    key,
    instructor: bios.some((b) => b.person === key) || disciplines.some((d) => d.instructor === key),
  }));

  writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    `${JSON.stringify(
      {
        version: 4, createdAt: new Date().toISOString(), categories, families, origins, disciplines,
        spaces, persons, photos, avatars, bios, galleries, partners,
      },
      null,
      2,
    )}\n`,
  );
  mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  // Sans les attributs étendus du Mac (com.apple.provenance…) ni ses fichiers « ._ » : le tar du
  // seeder (Linux) les signalerait un par un.
  execFileSync("tar", ["--no-xattrs", "-czf", OUT_FILE, "-C", OUT_DIR, "."], {
    env: { ...process.env, COPYFILE_DISABLE: "1" },
  });
  rmSync(OUT_DIR, { recursive: true, force: true });

  const folders = new Set(photos.map((p) => path.posix.dirname(p.path))).size;
  console.log(
    `✅ ${OUT_FILE} : ${photos.length} photos dans ${folders} dossiers, ${avatars.length} avatars, ` +
      `${bios.length} bios, ${spaces.length} espaces de groupe, ${disciplines.length} disciplines, ` +
      `${galleries.length} galeries, ${partners.length} partenaires`,
  );
  if (failed) {
    console.log(`   ${failed} illisibles (objet absent du stockage, ou fichier abîmé) ; première cause : ${firstError}`);
    if (photos.length === 0) console.log("   Aucune photo lue : le stockage de développement tourne-t-il (docker compose -f docker-compose.dev.yml ps) ?");
  }
  if (suggested) {
    console.log(`\n   ${suggested} noms repérés (bios, disciplines, galeries) et remplacés par des noms fictifs : ${NAMES_FILE}.`);
    console.log(`   Relisez-le : retirez ce qui n'est pas une personne, corrigez au besoin, puis relancez.`);
  }
  if (leftovers.size) {
    // Seulement dans ce terminal : rien de cette liste n'entre dans le paquet.
    console.log(`\n   Mots à majuscule restés dans les textes (noms à ajouter à ${NAMES_FILE} ?) :`);
    console.log(`   ${[...leftovers].sort((a, b) => a.localeCompare(b, "fr")).join(", ")}`);
  }
  console.log(`\n   Avant de le publier : ouvrez-le et regardez-le (tar -xzf ${OUT_FILE} -C /tmp/demo-pack).`);
}

main()
  .catch((error) => {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
