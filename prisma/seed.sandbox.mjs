#!/usr/bin/env node
// Seed DÉDIÉ à la sandbox recruteurs — identifiants CONNUS, idempotent.
// La production n'a pas de seed : ses données sont saisies sur le site. Lancé par le service `seeder`.

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

/**
 * Un compte de démo, remis à son état connu à chaque passage. `legal` : nom, majorité et, pour un
 * mineur, son parent référent (le parent n'a pas de compte : ses e-mails arrivent dans Mailpit).
 */
async function ensureUser({ email, firstName, hash, admin, adminGroupId, legal = {} }) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, emailVerified: true, isFirstLogin: false, ...legal },
    create: {
      email,
      firstName,
      password: hash,
      emailVerified: true,
      isFirstLogin: false,
      ...legal,
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
    // Majeur : il donne lui-même son autorisation de droit à l'image, en ligne.
    legal: { lastName: "Démo", legalAge: "ADULT" },
  });
  await ensureUser({
    email: "mineur@akfc.demo",
    firstName: "Mineur",
    hash,
    admin: false,
    adminGroupId,
    // Mineur, fiche complète : il indique ses souhaits, le lien part à « son parent ».
    legal: {
      lastName: "Démo",
      legalAge: "MINOR",
      birthDate: new Date("2012-05-04T00:00:00.000Z"),
      birthDateVerified: true,
      guardianName: "Parent Démo",
      guardianRelation: "mère",
      guardianEmail: "parent@akfc.demo",
    },
  });
  console.log("✅ Comptes de démo prêts");

  // Catégorie « Cours » — physique `courses` via categoryStorageSegment.
  const coursCategory = await prisma.category.upsert({
    where: { key: "course" },
    update: {},
    create: { key: "course", type: "Cours" },
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
  console.log("   Membre : membre@akfc.demo /  " + DEMO_PASSWORD + "  (majeur)");
  console.log("   Mineur : mineur@akfc.demo /  " + DEMO_PASSWORD + "  (parent : parent@akfc.demo, sans compte, e-mails dans Mailpit)");
  console.log("🌱 Seed sandbox terminé");
}

main()
  .catch((e) => {
    console.error("❌ Seed sandbox échoué :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
