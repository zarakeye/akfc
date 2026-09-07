#!/usr/bin/env node
// Seed DÉDIÉ à la sandbox recruteurs — identifiants CONNUS, idempotent.
// N'a rien à voir avec prisma/seed.js (prod). Lancé par le service `seeder`.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
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

  const adminId = await ensureUser({
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

  // Catégorie « Cours » — physique `courses` via categoryStorageSegment.
  const coursCategory = await prisma.category.upsert({
    where: { type: "Cours" },
    update: {},
    create: { type: "Cours" },
    select: { id: true },
  });

  console.log("✅ Catégorie « Cours » prête");

  // Disciplines (les « cours »). Le NOM porte accents/espaces ; le dossier
  // physique est slugifié à l'upload par le code → `courses/<slug>`. Le `slug`
  // sert aux URLs publiques. Instructeur = l'admin (champ requis).
  const DISCIPLINES = [
    { name: "Kali Escrima", slug: "kali-escrima" },
    { name: "Taolu multi-styles", slug: "taolu-multi-styles" },
    { name: "Tchoy Lee Fut", slug: "tchoy-lee-fut" },
    { name: "Taïchi Chuan", slug: "taichi-chuan" },
  ];
  for (const d of DISCIPLINES) {
    await prisma.discipline.upsert({
      where: { categoryId_name: { categoryId: coursCategory.id, name: d.name } },
      update: { slug: d.slug },
      create: {
        name: d.name,
        slug: d.slug,
        type: "MARTIAL_ART",
        categoryId: coursCategory.id,
        instructorId: adminId,
      },
    });
  }

  console.log("✅ Disciplines prêtes");

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
