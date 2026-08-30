#!/usr/bin/env bash
#
# AKFC — Auth role→groupe : nettoyage de prisma/seed.js (accompagne E2).
#
# Retire des sections devenues invalides après E2 :
#   - Permissions (upsert de 10 permissions)
#   - Rôles ADMIN / GUEST
#   - `roleId: adminRole.id` sur l'admin (×2)
# Et REMPLACE par ce qui confère désormais l'admin : l'adhésion au groupe
# Administrateurs (isAdminGroup). Sans ça, un fresh-seed ne créerait aucun admin
# capable de se connecter.
#
# JS pur → validé par `node --check` (pas de typecheck). Pas de commit : ton étape
# E2 manuelle (git add -A) le capturera.
#
# Usage : bash clean-seed-role-to-group.sh
#
set -euo pipefail

SEED="prisma/seed.js"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SEED" ]        || { echo "ERREUR: $SEED introuvable." >&2; exit 1; }

python3 - "$SEED" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

def drop(old, *, count=1):
    global s
    if old not in s:
        print(f"— ancre absente (déjà fait ?) : {old[:50].strip()}"); return
    c = s.count(old)
    assert c == count, f"ancre x{c} (attendu {count}) : {old[:50].strip()}"
    s = s.replace(old, "")
    print(f"✓ retiré : {old[:50].strip()}…")

# 1. Permissions
drop("""  // ==========================================================================
  // 1. Permissions
  // ==========================================================================
  const PERMISSIONS = [
    "manage_users",
    "manage_roles",
    "manage_permissions",
    "manage_posts",
    "manage_comments",
    "manage_categories",
    "manage_disciplines",
    "manage_courses",
    "manage_stages",
    "view_posts",
  ];

  const permissionRecords = [];
  for (const permission of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: { name: permission },
    });
    permissionRecords.push(perm);
  }
  console.log("✅ Permissions seeded:", permissionRecords.length);

""")

# 2. Roles ADMIN + GUEST
drop("""  // ==========================================================================
  // 2. Roles
  // ==========================================================================
  // Le rôle ADMIN doit TOUJOURS détenir l'intégralité des permissions
  // existantes — si on ajoute une permission plus tard, elle est
  // automatiquement propagée à ADMIN au prochain seed (pas besoin de rejouer
  // manuellement une query SQL).
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {
      description: "Administrateur — accès total",
      permissions: {
        // On écrase la liste : tous les liens actuels sont supprimés, puis
        // recréés depuis `permissionRecords` pour coller à la liste à jour.
        deleteMany: {},
        create: permissionRecords.map((p) => ({ permissionId: p.id })),
      },
    },
    create: {
      name: "ADMIN",
      description: "Administrateur — accès total",
      permissions: {
        create: permissionRecords.map((p) => ({ permissionId: p.id })),
      },
    },
  });
  console.log(
    `✅ Role ADMIN seeded with ${permissionRecords.length} permission(s)`
  );

  const guestRole = await prisma.role.upsert({
    where: { name: "GUEST" },
    update: {},
    create: {
      name: "GUEST",
      description:
        "Intervenant extérieur — référencement nominal pour les stages, ne se connecte pas",
    },
  });
  console.log("✅ Role GUEST seeded");

""")

# 3. roleId sur l'admin (update + create)
drop("      roleId: adminRole.id,\n", count=2)

# 3bis. Insérer l'adhésion au groupe Administrateurs avant "4. Catégories"
anchor = """  // ==========================================================================
  // 4. Catégories"""
block = """  // ==========================================================================
  // 3bis. Groupe Administrateurs (confère l'accès admin) + adhésion
  // ==========================================================================
  // L'admin n'est plus défini par un rôle mais par son appartenance au groupe
  // Administrateurs (singleton isAdminGroup, cf. ensureAdminGroup).
  let adminGroup = await prisma.memberGroup.findFirst({
    where: { isAdminGroup: true },
  });
  if (!adminGroup) {
    adminGroup = await prisma.memberGroup.create({
      data: {
        name: "Administrateurs",
        isAdminGroup: true,
        isCollaborative: true,
      },
    });
  }
  await prisma.memberGroupMembership.upsert({
    where: {
      groupId_userId: { groupId: adminGroup.id, userId: adminUser.id },
    },
    update: {},
    create: {
      groupId: adminGroup.id,
      userId: adminUser.id,
      access: "EDITOR",
    },
  });
  console.log("✅ Groupe Administrateurs + adhésion admin seeded");

  // ==========================================================================
  // 4. Catégories"""
if "3bis. Groupe Administrateurs" in s:
    print("— bloc groupe admin déjà présent")
else:
    assert s.count(anchor) == 1, "ancre '4. Catégories' introuvable/multiple"
    s = s.replace(anchor, block)
    print("✓ inséré : adhésion groupe Administrateurs")

p.write_text(s, encoding="utf-8")
PY

echo "vérif syntaxe (node --check)…"
if ! node --check "$SEED" 2>/tmp/akfc_seed.log; then
  echo "syntaxe KO :"; cat /tmp/akfc_seed.log; exit 1
fi
echo "OK — seed syntaxiquement valide (sera committé avec ton étape E2)."