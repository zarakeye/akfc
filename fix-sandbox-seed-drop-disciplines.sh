#!/usr/bin/env bash
#
# AKFC — Correctif seed sandbox : retirer le bloc disciplines (schéma migré).
#
# Le modèle Discipline n'a plus `family`/`type`/`origin` en chaînes (devenus des
# relations familyId/originId, pas de champ type). On retire ce bloc : les
# comptes de démo + catégories + dossiers suffisent, et créer une discipline via
# l'UI démontre mieux la feature.
#
# Réécrit prisma/seed.sandbox.mjs (sans disciplines), puis relance le seeder.
#
# Usage : bash fix-sandbox-seed-drop-disciplines.sh
#
set -euo pipefail

SEED="prisma/seed.sandbox.mjs"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SEED" ]        || { echo "ERREUR: $SEED introuvable." >&2; exit 1; }

cat > "$SEED" <<'JS'
#!/usr/bin/env node
// Seed DÉDIÉ à la sandbox recruteurs — identifiants CONNUS, idempotent.
// N'a rien à voir avec prisma/seed.js (prod). Lancé par le service `seeder`.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const APP_ROOT = process.env.APP_SHORT_NAME || "AKFC";
const DEMO_PASSWORD = "sandbox";

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
JS
echo "réécrit  $SEED (sans disciplines)"
node --check "$SEED" && echo "syntaxe OK"

cat <<'EOF'

════════ RELANCER LE SEEDER ════════
Le seed change → il faut le rebâtir dans l'image du seeder :
  docker compose -f docker-compose.sandbox.yml up -d --build seeder
  docker compose -f docker-compose.sandbox.yml logs -f seeder

Attendu : "Seed sandbox terminé" + les identifiants, puis exited(0).

Puis (re)lance l'app si besoin (elle attend le seeder) :
  docker compose -f docker-compose.sandbox.yml up -d app

Et connecte-toi sur http://localhost:3010 :
  Admin  : admin@akfc.demo  / sandbox
  Membre : membre@akfc.demo / sandbox
EOF