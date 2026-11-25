// Le paquet de démo dans la sandbox : photos, avatars et bios d'instructeur, sur des personnes,
// des groupes et des disciplines FICTIFS. Appelé par seed.sandbox.mjs ; idempotent.
//
// Le paquet (demo-pack.tar.gz, fait par `pnpm demo:pack` sur le Mac) est cherché :
//   1. à l'adresse AKFC_DEMO_PACK_URL (une release GitHub, pour Killercoda) ;
//   2. sinon dans /demo-data/demo-pack.tar.gz (le dossier demo-data/ du dépôt, monté en lecture).
// Sans paquet, la sandbox démarre quand même, sans photos.
//
// Les chemins du paquet sont ceux de la bibliothèque, relatifs à la racine, avec `{person-N}` et
// `{group-N}` à la place des identifiants : ils deviennent `<nom>-<id>` des personnes et des
// groupes créés ici. Les fichiers gardent ainsi leur dossier et leur nom, et les liens marchent.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { CopyObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { assertLocalTarget } from "./db-target.mjs";

const APP_ROOT = process.env.NEXT_PUBLIC_APP_SHORT_NAME || "AKFC";
const LOCAL_PACK = process.env.AKFC_DEMO_PACK_FILE || "/demo-data/demo-pack.tar.gz";
const EMAIL_DOMAIN = "sandbox.local";

// Des noms inventés : la personne N reçoit toujours le même.
const FIRST_NAMES = [
  "Lucie", "Antoine", "Maëlle", "Bastien", "Inès", "Romain", "Clémence", "Théo", "Margaux", "Julien",
  "Salomé", "Adrien", "Elsa", "Quentin", "Noémie", "Florian", "Jeanne", "Maxime", "Anaïs", "Victor",
];
const LAST_NAMES = [
  "Morel", "Garnier", "Perrin", "Lacroix", "Fabre", "Brunet", "Rolland", "Chevalier", "Barbier", "Colin",
  "Picard", "Arnaud", "Gautier", "Renaud", "Masson", "Leclerc", "Dumont", "Marchand", "Aubert", "Blanc",
];

/** Comme slugify({ lower, strict }) pour des noms latins : minuscules, sans accents, tirets. */
function slug(input) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** @returns {Promise<string | null>} le dossier où le paquet est déballé */
async function unpack() {
  const url = process.env.AKFC_DEMO_PACK_URL?.trim();
  let archive = existsSync(LOCAL_PACK) && statSync(LOCAL_PACK).isFile() ? LOCAL_PACK : null;
  const dir = mkdtempSync(path.join(tmpdir(), "demo-pack-"));
  if (url) {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`paquet de démo : ${url} → HTTP ${res.status}`);
    archive = path.join(dir, "pack.tar.gz");
    writeFileSync(archive, Buffer.from(await res.arrayBuffer()));
  }
  if (!archive) return null;
  execFileSync("tar", ["-xzf", archive, "-C", dir]);
  return dir;
}

export function storageClient() {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  if (!endpoint || !bucket) throw new Error("paquet de démo : R2_ENDPOINT et R2_BUCKET sont requis");
  assertLocalTarget(endpoint, "R2_ENDPOINT");
  const s3 = new S3Client({
    endpoint,
    region: "auto",
    forcePathStyle: process.env.R2_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
  /** Dépose l'objet, sauf s'il est déjà là avec la même taille (relance du seed). */
  const put = async (/** @type {string} */ key, /** @type {Buffer} */ body, contentType = "image/jpeg") => {
    try {
      const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      if (head.ContentLength === body.byteLength) return;
    } catch {
      // absent : on le dépose
    }
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
  };
  /** Copie un objet du stockage vers une autre clé. */
  const copy = async (/** @type {string} */ from, /** @type {string} */ to) => {
    await s3.send(new CopyObjectCommand({ Bucket: bucket, CopySource: `${bucket}/${encodeURI(from)}`, Key: to }));
  };
  return { put, copy };
}

/**
 * @param {{
 *   prisma: import("@prisma/client").PrismaClient;
 *   adminId: string;
 *   adminGroupId: string;
 *   hash: string;
 * }} ctx
 * @returns {Promise<null | {
 *   persons: { id: string; instructor: boolean }[];
 *   photos: { id: string; path: string; fullPath: string }[];
 * }>} ce que le décor des parcours réutilise ; null sans paquet
 */
export async function seedDemoPack({ prisma, adminId, adminGroupId, hash }) {
  assertLocalTarget(process.env.DATABASE_URL ?? "", "DATABASE_URL");
  const dir = await unpack();
  if (!dir) {
    console.log("ℹ Pas de paquet de démo (AKFC_DEMO_PACK_URL, demo-data/demo-pack.tar.gz) : sandbox sans photos");
    return null;
  }
  try {
    const manifest = JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8"));
    if (manifest.version !== 3) throw new Error(`paquet de démo : version ${manifest.version}, 3 attendue`);
    const storage = storageClient();

    // 1. Les catégories et les disciplines, avec les segments de dossier du paquet.
    /** @type {Map<string, number>} segment → id */
    const categoryIds = new Map();
    for (const c of manifest.categories) {
      const found =
        (await prisma.category.findUnique({ where: { storageSegment: c.storageSegment } })) ??
        (c.key ? await prisma.category.findUnique({ where: { key: c.key } }) : null) ??
        (await prisma.category.findUnique({ where: { type: c.type } }));
      const row = found
        ? await prisma.category.update({
            where: { id: found.id },
            data: { storageSegment: found.storageSegment ?? c.storageSegment, key: found.key ?? c.key },
          })
        : await prisma.category.create({ data: { type: c.type, key: c.key, storageSegment: c.storageSegment } });
      categoryIds.set(row.storageSegment ?? c.storageSegment, row.id);
    }

    // 2. Les personnes fictives. Un instructeur est administrateur, comme au club : sa bio peut
    // montrer des photos de la bibliothèque.
    /** @type {Map<string, { id: string; firstName: string; lastName: string; pseudo: string | null; space: string }>} */
    const persons = new Map();
    for (const p of manifest.persons) {
      const n = Number(p.key.split("-")[1]) - 1;
      const firstName = FIRST_NAMES[n % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(n * 7) % LAST_NAMES.length];
      const pseudo = p.instructor ? firstName : null;
      const email = `${slug(firstName)}.${slug(lastName)}@${EMAIL_DOMAIN}`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { firstName, lastName, pseudo },
        create: {
          email, firstName, lastName, pseudo, password: hash,
          emailVerified: true, isFirstLogin: false, legalAge: "ADULT",
        },
        select: { id: true },
      });
      if (p.instructor) {
        await prisma.memberGroupMembership.upsert({
          where: { groupId_userId: { groupId: adminGroupId, userId: user.id } },
          update: {},
          create: { groupId: adminGroupId, userId: user.id, access: "EDITOR" },
        });
      }
      persons.set(p.key, {
        id: user.id, firstName, lastName, pseudo,
        space: `${slug(`${firstName} ${lastName}`)}-${user.id}`,
      });
    }
    const instructorIds = manifest.persons.filter((p) => p.instructor).map((p) => persons.get(p.key).id);

    const disciplineIds = new Map();
    let i = 0;
    for (const d of manifest.disciplines) {
      const categoryId = categoryIds.get(d.category);
      if (!categoryId) continue;
      const instructorId = instructorIds.length ? instructorIds[i++ % instructorIds.length] : adminId;
      const found =
        (await prisma.discipline.findUnique({
          where: { categoryId_storageSegment: { categoryId, storageSegment: d.storageSegment } },
        })) ?? (await prisma.discipline.findUnique({ where: { categoryId_name: { categoryId, name: d.name } } }));
      let row;
      if (found) {
        row = await prisma.discipline.update({
          where: { id: found.id },
          data: { instructorId, storageSegment: found.storageSegment ?? d.storageSegment },
        });
      } else {
        let s = slug(d.name) || d.storageSegment;
        for (let k = 2; await prisma.discipline.findUnique({ where: { slug: s } }); k++) s = `${slug(d.name)}-${k}`;
        row = await prisma.discipline.create({
          data: {
            name: d.name, type: d.type, slug: s, categoryId, instructorId,
            storageSegment: d.storageSegment, publicationDate: new Date(),
          },
        });
      }
      disciplineIds.set(`${d.category}/${row.storageSegment ?? d.storageSegment}`, row.id);
    }

    // 3. Les groupes collaboratifs, avec leur espace.
    const groups = new Map();
    for (const s of manifest.spaces) {
      const group =
        (await prisma.memberGroup.findFirst({ where: { name: s.name, isCollaborative: true }, select: { id: true } })) ??
        (await prisma.memberGroup.create({ data: { name: s.name, isCollaborative: true }, select: { id: true } }));
      await prisma.memberGroupMembership.upsert({
        where: { groupId_userId: { groupId: group.id, userId: adminId } },
        update: {},
        create: { groupId: group.id, userId: adminId, access: "EDITOR" },
      });
      groups.set(s.key, `${slug(s.name) || "groupe"}-${group.id}`);
    }

    /** `{person-1}` → `<nom>-<id>`, `{group-1}` → `<nom>-<id>` (avatars : l'id seul). */
    const realPath = (/** @type {string} */ packPath) => {
      const parts = packPath.split("/");
      const key = parts[1]?.replace(/^\{|\}$/g, "");
      if (parts[0] === "personal-space") parts[1] = persons.get(key).space;
      else if (parts[0] === "collaborative-group-spaces") parts[1] = groups.get(key);
      else if (parts[0] === "avatars") parts[1] = persons.get(key).id;
      return `${APP_ROOT}/${parts.join("/")}`;
    };

    // 4. Les photos : l'objet dans le stockage, sa fiche, et les dossiers qui y mènent.
    /** @type {Map<string, string>} chemin du paquet → id du média */
    const mediaIds = new Map();
    /** @type {{ id: string; path: string; fullPath: string }[]} */
    const photos = [];
    const folders = new Set();
    for (const photo of manifest.photos) {
      const body = readFileSync(path.join(dir, "photos", photo.file));
      const fullPath = realPath(photo.path);
      await storage.put(fullPath, body);
      const parts = photo.path.split("/");
      const personKey = parts[0] === "personal-space" ? parts[1].replace(/^\{|\}$/g, "") : null;
      const categoryId = categoryIds.get(parts[0]) ?? null;
      const disciplineId = categoryId ? (disciplineIds.get(`${parts[0]}/${parts[1]}`) ?? null) : null;
      const data = {
        mimeType: "image/jpeg",
        format: "jpg",
        originalFileName: path.posix.basename(photo.path),
        bytes: body.byteLength,
        width: photo.width,
        height: photo.height,
        appRoot: APP_ROOT,
        status: "published",
        categoryId,
        disciplineId,
        uploaderUserId: personKey ? persons.get(personKey).id : adminId,
      };
      const asset = await prisma.mediaAsset.upsert({
        where: { fullPath },
        update: data,
        create: { fullPath, ...data },
        select: { id: true },
      });
      mediaIds.set(photo.path, asset.id);
      photos.push({ id: asset.id, path: photo.path, fullPath });
      const segs = fullPath.split("/").slice(0, -1);
      for (let k = 2; k <= segs.length; k++) folders.add(segs.slice(0, k).join("/"));
    }
    for (const fullPath of folders) {
      await prisma.folder.upsert({
        where: { appRoot_fullPath: { appRoot: APP_ROOT, fullPath } },
        create: { appRoot: APP_ROOT, fullPath, status: "published" },
        update: {},
      });
    }

    // 5. Les avatars (hors bibliothèque : une clé sur la fiche du membre).
    for (const a of manifest.avatars) {
      const key = realPath(a.path);
      await storage.put(key, readFileSync(path.join(dir, "photos", a.file)));
      await prisma.user.update({ where: { id: persons.get(a.person).id }, data: { avatar: key } });
    }

    // 6. Les bios : les noms de la personne fictive, et les médias du paquet.
    const resolve = (/** @type {unknown} */ node) => {
      if (typeof node === "string") {
        return node.replace(/\{(person-\d+)\.(firstName|lastName|pseudo)\}/g, (_m, key, field) => {
          const p = persons.get(key);
          return p ? (p[field] ?? p.firstName) : "";
        });
      }
      if (Array.isArray(node)) return node.map(resolve).filter((n) => n !== null);
      if (node && typeof node === "object") {
        /** @type {Record<string, unknown>} */
        const out = {};
        for (const [k, v] of Object.entries(node)) {
          if (k === "mediaId" && typeof v === "string" && v.startsWith("media:")) {
            const id = mediaIds.get(v.slice("media:".length));
            if (!id) return null;
            out[k] = id;
          } else if (k === "userId" && typeof v === "string" && v.startsWith("person:")) {
            const p = persons.get(v.slice("person:".length));
            if (!p) return null;
            out[k] = p.id;
          } else {
            const r = resolve(v);
            if (r === null && v !== null) continue;
            out[k] = r;
          }
        }
        return out;
      }
      return node;
    };
    for (const b of manifest.bios) {
      const person = persons.get(b.person);
      const content = resolve(b.content);
      await prisma.user.update({
        where: { id: person.id },
        data: { instructorBio: content, instructorOrder: b.order },
      });
      const used = new Set(JSON.stringify(content).match(/"mediaId":"([^"]+)"/g)?.map((m) => m.slice(11, -1)) ?? []);
      for (const mediaAssetId of used) {
        await prisma.pageMediaReference.upsert({
          where: { mediaAssetId_pageType_pageId: { mediaAssetId, pageType: "INSTRUCTOR_BIO", pageId: person.id } },
          update: {},
          create: { mediaAssetId, pageType: "INSTRUCTOR_BIO", pageId: person.id },
        });
      }
    }

    console.log(
      `✅ Paquet de démo : ${manifest.photos.length} photos, ${manifest.avatars.length} avatars, ` +
        `${manifest.bios.length} bios, ${persons.size} personnes, ${groups.size} groupes`,
    );
    for (const p of persons.values()) {
      if (instructorIds.includes(p.id)) console.log(`   Instructeur : ${p.firstName} ${p.lastName}`);
    }
    return {
      persons: [...persons.values()].map((p) => ({ id: p.id, instructor: instructorIds.includes(p.id) })),
      photos,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
