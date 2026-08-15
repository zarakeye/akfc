#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, ÉTAPE 2 / point 1 : le groupe « Administrateurs ».
#
# ADDITIF, sans aucun déplacement de données (le renommage/déplacement de
# « general » vers l'espace du groupe admin est le point 2, isolé, avec dump).
#
#   - Schéma : `MemberGroup.isAdminGroup` (Boolean, défaut false) → identifie le
#     groupe admin UNIQUE (le plus privilégié). Migration additive.
#   - Service `ensureAdminGroup(prisma, appRoot)` : garantit le groupe
#     « Administrateurs » (collaboratif, isAdminGroup), y inscrit tous les
#     utilisateurs de rôle ADMIN en EDITOR, et matérialise son espace. Idempotent.
#   - instrumentation.ts : appel au boot (après ensureAllGroupSpaces).
#
# Prérequis : 1a + `apply-collab-empty-group-spaces.sh` (ensureGroupSpaceFolder)
#   + `apply-collab-backfill-group-spaces-boot.sh` (bloc ensureAllGroupSpaces
#   dans instrumentation).
# Migration à appliquer ensuite (local + serveur) : `pnpm prisma migrate deploy`.
#
# Usage : bash apply-collab-etape2-1-admin-group.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-etape2-1-admin-group.sh   (clone)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
INSTR="apps/web/instrumentation.ts"
SVC="packages/backend/src/modules/memberGroups/ensureAdminGroup.service.ts"
MIG_DIR="prisma/migrations/20261016000000_member_group_admin_flag"

for f in "package.json" "$SCHEMA" "$INSTR"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f (lance depuis la racine)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── 1) Schéma : isAdminGroup ────────────────────────────────────────────────
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
sp = pathlib.Path(sys.argv[1]); s = sp.read_text(encoding="utf-8")
if "isAdminGroup" in s:
    print("schéma déjà à jour")
else:
    OLD = ("  /// Diffusion (défaut) vs espace collaboratif (dossier finder dédié + droits).\n"
           "  isCollaborative Boolean @default(false)\n"
           "  createdAt   DateTime @default(now())")
    NEW = ("  /// Diffusion (défaut) vs espace collaboratif (dossier finder dédié + droits).\n"
           "  isCollaborative Boolean @default(false)\n"
           "  /// Groupe « Administrateurs » UNIQUE (le plus privilégié) : son espace\n"
           "  /// deviendra l'ex-dossier « general ». Singleton garanti par ensureAdminGroup.\n"
           "  isAdminGroup Boolean @default(false)\n"
           "  createdAt   DateTime @default(now())")
    assert s.count(OLD) == 1, "ancre MemberGroup.isCollaborative (post-1a) introuvable"
    s = s.replace(OLD, NEW)
    sp.write_text(s, encoding="utf-8")
    print("schéma patché (isAdminGroup)")
PY

# ── 2) Migration ────────────────────────────────────────────────────────────
if [ ! -f "$MIG_DIR/migration.sql" ]; then
  mkdir -p "$MIG_DIR"
  cat > "$MIG_DIR/migration.sql" <<'SQL'
-- AlterTable
ALTER TABLE "MemberGroup" ADD COLUMN "isAdminGroup" BOOLEAN NOT NULL DEFAULT false;
SQL
  echo "migration écrite : $MIG_DIR/migration.sql"
else
  echo "migration déjà présente"
fi

# ── 3) Service ensureAdminGroup ─────────────────────────────────────────────
if [ ! -f "$SVC" ]; then
  cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";

import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";

const ADMIN_GROUP_NAME = "Administrateurs";

/**
 * Garantit le groupe « Administrateurs » UNIQUE (collaboratif, isAdminGroup),
 * y inscrit tous les utilisateurs de rôle ADMIN en EDITOR, et matérialise son
 * espace. Idempotent — appelé au boot.
 *
 * NB : le DÉPLACEMENT de l'ex-dossier « general » dans cet espace est une étape
 * SÉPARÉE (déplacement de données, avec sauvegarde) — pas ici.
 */
export async function ensureAdminGroup(
  prisma: PrismaClient,
  appRoot: string,
): Promise<{ groupId: string; adminsLinked: number }> {
  let group = await prisma.memberGroup.findFirst({
    where: { isAdminGroup: true },
    select: { id: true },
  });

  if (!group) {
    group = await prisma.memberGroup.create({
      data: {
        name: ADMIN_GROUP_NAME,
        isCollaborative: true,
        isAdminGroup: true,
      },
      select: { id: true },
    });
  }

  const admins = await prisma.user.findMany({
    where: { role: { name: "ADMIN" } },
    select: { id: true },
  });

  for (const admin of admins) {
    await prisma.memberGroupMembership.upsert({
      where: { groupId_userId: { groupId: group.id, userId: admin.id } },
      create: { groupId: group.id, userId: admin.id, access: "EDITOR" },
      update: {},
    });
  }

  await ensureGroupSpaceFolder({ prisma, appRoot, groupId: group.id });

  return { groupId: group.id, adminsLinked: admins.length };
}
TS
  echo "service écrit : $SVC"
else
  echo "service déjà présent"
fi

# ── 4) instrumentation.ts : import + appel après ensureAllGroupSpaces ───────
python3 - "$INSTR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "ensureAdminGroup" in s:
    print("instrumentation déjà à jour")
    sys.exit(0)

IMP_OLD = ('  const { ensureAllGroupSpaces } = await import(\n'
           '    "@backend/modules/memberGroups/ensureAllGroupSpaces.service"\n'
           '  );')
IMP_NEW = (IMP_OLD + "\n"
           '  const { ensureAdminGroup } = await import(\n'
           '    "@backend/modules/memberGroups/ensureAdminGroup.service"\n'
           '  );')
assert s.count(IMP_OLD) == 1, "ancre import ensureAllGroupSpaces introuvable (backfill appliqué ?)"
s = s.replace(IMP_OLD, IMP_NEW)

CALL_OLD = ('    console.error(\n'
            '      "[instrumentation] ensureAllGroupSpaces failed — app will still start",\n'
            '      err\n'
            '    );\n'
            '  }\n'
            '}')
CALL_NEW = ('    console.error(\n'
            '      "[instrumentation] ensureAllGroupSpaces failed — app will still start",\n'
            '      err\n'
            '    );\n'
            '  }\n'
            '\n'
            '  try {\n'
            '    const { adminsLinked } = await ensureAdminGroup(prisma, APP_ROOT);\n'
            '    console.log(\n'
            '      `[instrumentation] ensureAdminGroup: groupe Administrateurs garanti, ${adminsLinked} admin(s) inscrit(s) pour appRoot="${APP_ROOT}"`\n'
            '    );\n'
            '  } catch (err) {\n'
            '    console.error(\n'
            '      "[instrumentation] ensureAdminGroup failed — app will still start",\n'
            '      err\n'
            '    );\n'
            '  }\n'
            '}')
assert s.count(CALL_OLD) == 1, "ancre fin ensureAllGroupSpaces introuvable (backfill appliqué ?)"
s = s.replace(CALL_OLD, CALL_NEW)

p.write_text(s, encoding="utf-8")
print("instrumentation.ts câblé (ensureAdminGroup au boot)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de prisma generate, ni typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -8 /tmp/akfc_gen.log; exit 1; }
echo "✅ client régénéré"

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(groups): étape 2.1 — groupe Administrateurs (isAdminGroup) + inscription des admins au boot" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo ""
  echo "➡️  Applique la migration (local) puis redémarre :"
  echo '    PG_IP=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" "$(docker ps -qf name=postgres)")'
  echo '    DATABASE_URL="postgresql://akfc:LE_MDP@${PG_IP}:5432/akfc_db?schema=public" \'
  echo '    DIRECT_DATABASE_URL="postgresql://akfc:LE_MDP@${PG_IP}:5432/akfc_db?schema=public" \'
  echo "    pnpm prisma migrate deploy"
  echo "    puis relance pnpm dev → log '[instrumentation] ensureAdminGroup: …'"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi