#!/usr/bin/env bash
#
# AKFC — Sandbox, PHASE 5b : seed de démo + service seeder.
#
#   1. prisma/seed.sandbox.mjs : seed DÉDIÉ sandbox (n'écrase pas le seed prod) :
#        - groupe Administrateurs ;
#        - admin de démo  (admin@akfc.demo / sandbox) → membre d'Administrateurs ;
#        - membre de démo (membre@akfc.demo / sandbox) → non-admin ;
#        - catégories + dossiers racines + quelques disciplines.
#      IDEMPOTENT (upserts) : re-`up` ré-assure les comptes de démo sans toucher
#      à ce que le recruteur a créé.
#   2. docker-compose.sandbox.yml : service `seeder` (après migrator) + l'app
#      attend le seeder → data prête au premier rendu.
#
# Reset total (efface volumes → base + MinIO vierges → re-seed au prochain up) :
#   docker compose -f docker-compose.sandbox.yml down -v
#
# Ne touche pas au code de l'app. Pas de commit.
#
# Usage : bash sandbox-phase5b-seed.sh
#
set -euo pipefail

SEED="prisma/seed.sandbox.mjs"
COMPOSE="docker-compose.sandbox.yml"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$COMPOSE" ]     || { echo "ERREUR: $COMPOSE introuvable — applique la Phase 5a d'abord." >&2; exit 1; }

# ── 1. Seed sandbox ──────────────────────────────────────────────────────────
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

  // Catégories
  const categoryByType = {};
  for (const type of ["Cours", "Stage", "Event"]) {
    const cat = await prisma.category.upsert({
      where: { type },
      update: {},
      create: { type },
    });
    categoryByType[type] = cat;
  }

  // Dossiers racines Cloudinary/MinIO (immuables)
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

  // Quelques disciplines (catégorie Cours) pour que l'app ne soit pas vide
  const coursId = categoryByType["Cours"].id;
  const DISCIPLINES = [
    { name: "Taï-chi", type: "MARTIAL_ART", family: "Kung-fu Wushu", origin: "Chine",
      description: "Pratique interne, lente et continue." },
    { name: "Kali Escrima", type: "MARTIAL_ART", origin: "Philippines",
      description: "Art martial philippin centré sur les armes." },
    { name: "Tchoy-Lee-Fut", type: "MARTIAL_ART", family: "Kung-fu Wushu", origin: "Chine du Sud",
      description: "Style externe du Sud de la Chine." },
  ];
  for (const d of DISCIPLINES) {
    await prisma.discipline.upsert({
      where: { categoryId_name: { categoryId: coursId, name: d.name } },
      update: {},
      create: { ...d, categoryId: coursId, instructorId: adminId },
    });
  }
  console.log("✅ Contenu de démo prêt");

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
echo "créé  $SEED"
node --check "$SEED" && echo "syntaxe OK"

# ── 2. Service seeder + dépendance app ───────────────────────────────────────
python3 - "$COMPOSE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "seed.sandbox.mjs" in s:
    print("compose : seeder déjà présent"); sys.exit(0)

# 2a. insérer le service seeder juste après le service migrator (avant `  app:`)
app_anchor = "  app:\n    build:\n"
assert s.count(app_anchor) == 1, "ancre service app introuvable"
seeder = (
    "  # Peuple la base de comptes de démo + contenu, puis s'arrête. Idempotent.\n"
    "  seeder:\n"
    "    build:\n"
    "      context: .\n"
    "      dockerfile: Dockerfile\n"
    "      target: migrator\n"
    "    depends_on:\n"
    "      migrator:\n"
    "        condition: service_completed_successfully\n"
    "    environment:\n"
    '      DATABASE_URL: "postgresql://akfc:sandbox@postgres:5432/akfc_db?schema=public"\n'
    '      DIRECT_DATABASE_URL: "postgresql://akfc:sandbox@postgres:5432/akfc_db?schema=public"\n'
    '      PRISMA_CLIENT_ENGINE_TYPE: "library"\n'
    '      APP_SHORT_NAME: "AKFC"\n'
    '    command: ["sh", "-c", "pnpm prisma generate && node prisma/seed.sandbox.mjs"]\n'
    "\n"
)
s = s.replace(app_anchor, seeder + app_anchor)

# 2b. l'app attend le seeder
dep_anchor = (
    "      migrator:\n"
    "        condition: service_completed_successfully\n"
    "      minio-init:\n"
)
assert s.count(dep_anchor) == 1, "ancre depends_on app introuvable"
s = s.replace(
    dep_anchor,
    "      migrator:\n"
    "        condition: service_completed_successfully\n"
    "      seeder:\n"
    "        condition: service_completed_successfully\n"
    "      minio-init:\n",
)

p.write_text(s, encoding="utf-8")
print("compose : service seeder ajouté + app attend le seeder")
PY

echo "validation compose…"
if docker compose -f "$COMPOSE" config >/dev/null 2>/tmp/akfc_compose.log; then
  echo "OK — compose valide."
else
  echo "compose KO :"; cat /tmp/akfc_compose.log; exit 1
fi

cat <<'EOF'

════════ (RE)DÉMARRAGE ════════
  docker compose -f docker-compose.sandbox.yml up -d --build
  docker compose -f docker-compose.sandbox.yml logs -f seeder app

Attendus :
  - seeder : "Seed sandbox terminé" + les identifiants, puis exited(0)
  - app    : "✓ Ready"

Puis sur http://localhost:3010, connecte-toi :
  Admin  : admin@akfc.demo  / sandbox   → dashboard, création d'utilisateurs, finder…
  Membre : membre@akfc.demo / sandbox   → vue non-admin

Test média de bout en bout (le grand moment) : en admin, va dans la bibliothèque
et uploade une image → elle part en presigned PUT vers MinIO, et s'affiche via
imgproxy. Vérifie aussi Mailpit (http://localhost:8025) si tu crées un utilisateur
(le mail de bienvenue y est capturé).

Reset total : docker compose -f docker-compose.sandbox.yml down -v
EOF