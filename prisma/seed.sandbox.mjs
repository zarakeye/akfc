#!/usr/bin/env node
// Seed DÉDIÉ à la sandbox recruteurs — identifiants CONNUS, idempotent.
// N'a rien à voir avec prisma/seed.js (prod). Lancé par le service `seeder`.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const APP_ROOT = process.env.APP_SHORT_NAME || "AKFC";
const DEMO_PASSWORD = "sandbox-demo";

async function ensureAdminGroup() {
  let group = await prisma.memberGroup.findFirst({
    where: { isAdminGroup: true },
    select: { id: true },
  });
  if (!group) {
    group = await prisma.memberGroup.create({
      data: { name: "Administrateurs", isCollaborative: true, isAdminGroup: true },
      select: { id: true },
    });
  }
  return group.id;
}

async function ensureUser({ email, firstName, hash, admin, adminGroupId }) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, emailVerified: true, isFirstLogin: false },
    create: {
      email,
      firstName,
      password: hash,
      emailVerified: true,
      isFirstLogin: false,
    },
    select: { id: true },
  });
  if (admin) {
    await prisma.memberGroupMembership.upsert({
      where: { groupId_userId: { groupId: adminGroupId, userId: user.id } },
      update: {},
      create: { groupId: adminGroupId, userId: user.id, access: "EDITOR" },
    });
  }
  return user.id;
}

async function main() {
  console.log("🌱 Seed sandbox…");
  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const adminGroupId = await ensureAdminGroup();

  await ensureUser({
    email: "admin@akfc.demo",
    firstName: "Admin",
    hash,
    admin: true,
    adminGroupId,
  });
  await ensureUser({
    email: "membre@akfc.demo",
    firstName: "Membre",
    hash,
    admin: false,
    adminGroupId,
  });
  console.log("✅ Comptes de démo prêts");

  // Catégories
  for (const type of ["Cours", "Stage", "Event"]) {
    await prisma.category.upsert({
      where: { type },
      update: {},
      create: { type },
    });
  }

  // Dossiers racines (immuables)
  for (const f of [
    { fullPath: `${APP_ROOT}/pending`, status: "pending" },
    { fullPath: `${APP_ROOT}/published`, status: "published" },
    { fullPath: `${APP_ROOT}/bin`, status: "bin" },
  ]) {
    await prisma.folder.upsert({
      where: { appRoot_fullPath: { appRoot: APP_ROOT, fullPath: f.fullPath } },
      update: {},
      create: { appRoot: APP_ROOT, fullPath: f.fullPath, status: f.status },
    });
  }
  console.log("✅ Catégories + dossiers prêts");

  console.log("");
  console.log("   Admin  : admin@akfc.demo  /  " + DEMO_PASSWORD);
  console.log("   Membre : membre@akfc.demo /  " + DEMO_PASSWORD);
  console.log("🌱 Seed sandbox terminé");
}

main()
  .catch((e) => {
    console.error("❌ Seed sandbox échoué :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
