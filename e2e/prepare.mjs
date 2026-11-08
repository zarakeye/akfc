#!/usr/bin/env node
// @ts-check
/**
 * Prépare un lancement des tests de bout en bout (`pnpm e2e` l'appelle avant Playwright).
 *
 *   1. vérifie que la base et le stockage visés sont locaux et dédiés aux tests ;
 *   2. crée la base `akfc_e2e` si elle n'existe pas, puis la remet à zéro avec les migrations ;
 *   3. vide le bucket `akfc-e2e` (créé au besoin) ;
 *   4. écrit les données de test (`data.mjs`) : comptes, disciplines, un document, des droits.
 *
 * Chaque lancement part donc du même état, quel que soit ce qu'a modifié le précédent.
 * Il se fait AVANT le démarrage de l'application : son initialisation (instrumentation.ts) trouve
 * une base prête.
 */
import { execFileSync } from "node:child_process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { assertLocal, E2E_DATABASE_URL, E2E_DB, E2E_STORAGE } from "./env.mjs";
import { CONSENT_SINCE, DISCIPLINES, DOCUMENT_A, FAMILIES, MINOR, PASSWORD, SEMINAR, TINY_PDF, TINY_PNG_BASE64, USERS } from "./data.mjs";

assertLocal();

// ─── 1. La base : créée au besoin, puis remise à zéro par les migrations ───────────
async function ensureDatabase() {
  // Prisma lui-même, connecté à la base d'administration `postgres` : pas de client SQL de plus.
  const admin = new PrismaClient({
    datasourceUrl: E2E_DATABASE_URL.replace(`/${E2E_DB.database}?`, "/postgres?"),
  });
  try {
    const rows = await admin.$queryRaw`select 1 from pg_database where datname = ${E2E_DB.database}`;
    if (Array.isArray(rows) && rows.length === 0) await admin.$executeRawUnsafe(`create database "${E2E_DB.database}"`);
  } catch (err) {
    console.error("❌ Postgres injoignable sur 127.0.0.1:5435 : lancer « pnpm dev:infra ».");
    console.error(err instanceof Error ? err.message.split("\n").slice(-3).join("\n") : err);
    process.exit(1);
  } finally {
    await admin.$disconnect();
  }
}

await ensureDatabase();
execFileSync("pnpm", ["exec", "prisma", "migrate", "reset", "--force", "--skip-seed", "--skip-generate"], {
  stdio: ["ignore", "ignore", "inherit"],
  env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL, DIRECT_DATABASE_URL: E2E_DATABASE_URL },
});
console.log("✓ base akfc_e2e remise à zéro");

// ─── 2. Le stockage : un bucket vide ───────────────────────────────────────────────
const s3 = new S3Client({
  region: "auto",
  endpoint: E2E_STORAGE.endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: E2E_STORAGE.accessKeyId, secretAccessKey: E2E_STORAGE.secretAccessKey },
});
const Bucket = E2E_STORAGE.bucket;
try {
  await s3.send(new HeadBucketCommand({ Bucket }));
} catch {
  await s3.send(new CreateBucketCommand({ Bucket }));
}
for (;;) {
  const page = await s3.send(new ListObjectsV2Command({ Bucket }));
  const keys = (page.Contents ?? []).flatMap((o) => (o.Key ? [{ Key: o.Key }] : []));
  if (keys.length === 0) break;
  await s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: keys } }));
}
console.log("✓ bucket akfc-e2e vide");

// ─── 3. Les données de test ────────────────────────────────────────────────────────
const prisma = new PrismaClient({ datasourceUrl: E2E_DATABASE_URL });
const hash = await bcrypt.hash(PASSWORD, 10);

for (const u of Object.values(USERS)) {
  await prisma.user.create({
    data: { id: u.id, email: u.email, firstName: u.firstName, password: hash, emailVerified: true, isFirstLogin: false },
  });
}
const adminGroup = await prisma.memberGroup.create({
  data: { name: "Administrateurs", isCollaborative: true, isAdminGroup: true },
});
await prisma.memberGroupMembership.create({
  data: { groupId: adminGroup.id, userId: USERS.admin.id, access: "EDITOR" },
});

const category = await prisma.category.create({ data: { key: "course", type: "Cours" } });
// La catégorie des stages, sous un libellé qui n'est pas « Stage » : le code la reconnaît à sa clé.
// L'évènement manque exprès : la liste des catégories propose de le créer.
await prisma.category.create({ data: { key: "seminar", type: "Stages d'été" } });
const famille1 = await prisma.disciplineFamily.create({ data: FAMILIES.premiere });
const famille2 = await prisma.disciplineFamily.create({ data: FAMILIES.seconde });
const publiee = await prisma.discipline.create({
  data: {
    ...DISCIPLINES.publiee,
    type: "MARTIAL_ART",
    categoryId: category.id,
    familyId: famille1.id,
    instructorId: USERS.admin.id,
    publicationDate: new Date("2026-01-01T00:00:00Z"),
  },
});
const seconde = await prisma.discipline.create({
  data: {
    ...DISCIPLINES.seconde,
    type: "MARTIAL_ART",
    categoryId: category.id,
    familyId: famille2.id,
    instructorId: USERS.admin.id,
    publicationDate: new Date("2026-01-01T00:00:00Z"),
  },
});

await prisma.discipline.create({
  data: { ...DISCIPLINES.brouillon, type: "MARTIAL_ART", categoryId: category.id, instructorId: USERS.admin.id },
});

const EMPTY_PAGE = { version: 1, blocks: [] };
await prisma.seminar.create({
  data: {
    ...SEMINAR,
    audience: "ADULTS",
    originId: null,
    externalDisciplineLabel: "Discipline externe (e2e)",
    description: EMPTY_PAGE,
    program: EMPTY_PAGE,
    preRegistered: [],
    primaryAnimatorId: USERS.admin.id,
    animators: { connect: { id: USERS.admin.id } },
  },
});

const pdf = Buffer.from(TINY_PDF);
await s3.send(new PutObjectCommand({ Bucket, Key: DOCUMENT_A.key, Body: pdf, ContentType: "application/pdf" }));
const asset = await prisma.mediaAsset.create({
  data: {
    fullPath: DOCUMENT_A.key,
    mimeType: "application/pdf",
    format: "pdf",
    originalFileName: "convocation-membre-a.pdf",
    bytes: pdf.byteLength,
    appRoot: "AKFC",
    status: "published",
    uploaderUserId: USERS.admin.id,
  },
});
await prisma.memberDocument.create({
  data: {
    id: DOCUMENT_A.id,
    mediaAssetId: asset.id,
    title: DOCUMENT_A.title,
    audience: "SPECIFIC",
    publishedById: USERS.admin.id,
    recipients: { create: { userId: USERS.membreA.id } },
  },
});

// Une galerie publique par discipline publiée, chacune avec une image publiée (la page Galeries
// n'affiche pas une galerie vide) : elle les range comme le menu « Nos disciplines ».
const png = Buffer.from(TINY_PNG_BASE64, "base64");
for (const d of [seconde, publiee]) {
  const key = `AKFC/e2e/galerie-${d.id}.png`;
  await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: png, ContentType: "image/png" }));
  const image = await prisma.mediaAsset.create({
    data: {
      fullPath: key, mimeType: "image/png", format: "png", originalFileName: `galerie-${d.id}.png`,
      bytes: png.byteLength, width: 1, height: 1, appRoot: "AKFC", status: "published", uploaderUserId: USERS.admin.id,
    },
  });
  await prisma.gallery.create({
    data: {
      slug: `e2e-galerie-${d.id}`, title: `Galerie de ${d.name}`, visibility: "PUBLIC",
      disciplineId: d.id, categoryId: category.id, items: { create: { mediaAssetId: image.id } },
    },
  });
}

// « Nous contacter » publiée : le formulaire des membres y est (tuto « Contacter le club »).
await prisma.pageVisibility.create({ data: { key: "contacts", published: true } });

await prisma.user.update({
  where: { id: USERS.droitImage.id },
  data: { imageConsent: "GRANTED", imageConsentAt: new Date(CONSENT_SINCE) },
});

// Deux mineurs dont le club a tout renseigné : leur parent référent peut recevoir le lien.
for (const { user, guardian } of [
  { user: USERS.mineur, guardian: MINOR.guardian },
  { user: USERS.mineurPages, guardian: MINOR.guardianPages },
]) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastName: MINOR.lastName,
      legalAge: "MINOR",
      birthDate: new Date(MINOR.birthDate),
      birthDateVerified: true,
      guardianName: guardian.name,
      guardianEmail: guardian.email,
      guardianRelation: guardian.relation,
    },
  });
}

await prisma.$disconnect();
console.log(`✓ données de test : ${Object.keys(USERS).length} comptes, 3 disciplines, 2 familles, 2 galeries, 1 stage, 1 document`);
