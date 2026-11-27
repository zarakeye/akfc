#!/usr/bin/env node
// @ts-check
/**
 * Le décor des parcours de la démo, ajouté aux données des tests (e2e/prepare.mjs, lancé avant) :
 * les comptes du panneau (admin, membre, mineur et son parent ; Sam vient avec les demandes), et
 * les décors de la sandbox (prisma/seed.sandbox.decor.mjs) que les parcours supposent.
 *
 * Les photos de la sandbox viennent du paquet de démo ; ici, ce sont les images des données de
 * test, remplacées dans le stockage par une petite image : le test regarde où l'on clique, pas
 * ce que montre la photo.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { seedDroitImageDecor, seedEspaceDecor, seedMediathequeDecor, seedTicketsDecor } from "../../prisma/seed.sandbox.decor.mjs";
import { storageClient } from "../../prisma/seed.sandbox.pack.mjs";
import { assertLocal, E2E_APP_ENV, E2E_DATABASE_URL } from "../env.mjs";

assertLocal();
// Le stockage des tests, et pas celui d'un .env : storageClient lit ces variables.
for (const k of /** @type {const} */ (["R2_ENDPOINT", "R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_FORCE_PATH_STYLE"])) {
  process.env[k] = E2E_APP_ENV[k];
}

const prisma = new PrismaClient({ datasourceUrl: E2E_DATABASE_URL });
// Le mot de passe des comptes du panneau (apps/web/src/features/demo/demoAccounts.ts).
const hash = await bcrypt.hash("sandbox-demo", 10);
const domain = "sandbox.local";

/** @param {string} key @param {string} firstName @param {object} [extra] */
const account = (key, firstName, extra = {}) =>
  prisma.user.upsert({
    where: { email: `${key}@${domain}` },
    update: {},
    create: { email: `${key}@${domain}`, firstName, lastName: "Démo", password: hash, emailVerified: true, isFirstLogin: false, legalAge: "ADULT", ...extra },
  });
const admin = await account("admin", "Admin");
const membre = await account("membre", "Membre");
await account("mineur", "Mineur", {
  legalAge: "MINOR",
  birthDate: new Date("2012-05-04T00:00:00.000Z"),
  birthDateVerified: true,
  guardianName: "Parent Démo",
  guardianRelation: "mère",
  guardianEmail: `parent@${domain}`,
});

const adminGroup = await prisma.memberGroup.findFirstOrThrow({ where: { isAdminGroup: true } });
await prisma.memberGroupMembership.upsert({
  where: { groupId_userId: { groupId: adminGroup.id, userId: admin.id } },
  update: {},
  create: { groupId: adminGroup.id, userId: admin.id, access: "EDITOR" },
});
await seedTicketsDecor({ prisma, hash, domain, adminId: admin.id, adminGroupId: adminGroup.id, memberId: membre.id });

const images = await prisma.mediaAsset.findMany({
  where: { mimeType: { startsWith: "image/" }, NOT: { fullPath: { contains: "personal-space" } } },
  select: { id: true, fullPath: true },
  take: 9,
});
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAIAAAAuKetIAAAAQklEQVR42u3OMQ0AAAgDsM2/aXDBQUsF9LI1AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQGBK7m+YQGLVFpvbgAAAABJRU5ErkJggg==",
  "base64",
);
const storage = storageClient();
for (const i of images) await storage.put(i.fullPath, PNG, "image/png");
const pack = { photos: images.map((i) => ({ ...i, path: i.fullPath.replace(/^AKFC\//, "") })) };
await seedMediathequeDecor({ prisma, storage, appRoot: "AKFC", adminId: admin.id, pack });
await seedDroitImageDecor({ prisma, storage, appRoot: "AKFC", adminId: admin.id, hash, domain, pack });
await seedEspaceDecor({ prisma, memberId: membre.id });

// La page que complète « Construire une page », et les pages publiques que visitent les parcours.
const para = (/** @type {string} */ text) => ({ type: "paragraph", content: [{ type: "text", text }] });
await prisma.sitePage.upsert({
  where: { slug: "association" },
  update: {},
  create: {
    slug: "association",
    title: "L'association",
    content: {
      version: 1,
      blocks: [
        {
          id: "demo-intro",
          type: "tiptap",
          content: { type: "doc", content: [para("Le club accueille enfants, ados et adultes."), para("À compléter : l'histoire du club, le bureau, les valeurs…")] },
        },
      ],
    },
  },
});
for (const key of ["home", "contacts", "inscription"]) {
  await prisma.pageVisibility.upsert({ where: { key }, update: {}, create: { key, published: true } });
}
await prisma.$disconnect();
console.log(`✓ décor de la démo (${images.length} images)`);
