#!/usr/bin/env bash
#
# AKFC — Groupes de membres, increment 1/N : modèle Prisma + migration.
#
# Ajoute : `MemberGroup` (groupe nommé, ex. « Bureau »), `MemberGroupMembership`
# (un membre dans plusieurs groupes), `MemberDocumentGroup` (un document peut
# viser plusieurs groupes). Relations sur User et MemberDocument. L'enum
# `DocumentAudience` reste ALL_MEMBERS|SPECIFIC (SPECIFIC élargi à « ciblé » =
# groupes ∪ membres ad hoc) → NON cassant, le code existant compile.
#
# L'appartenance à un groupe est résolue DYNAMIQUEMENT (liste de diffusion) :
# un membre ajouté hérite des documents déjà publiés au groupe.
#
# Migration SQL fournie prête. Après ce script : `pnpm prisma migrate deploy`
# (local puis serveur — commandes exactes dans le message).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-groups-model.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-groups-model.sh
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
MIG_DIR="prisma/migrations/20261014000000_member_groups"

if [ ! -f "package.json" ] || [ ! -f "$SCHEMA" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($SCHEMA attendu)." >&2
  exit 1
fi

python3 - "$SCHEMA" <<'PY'
import sys, pathlib
sp = pathlib.Path(sys.argv[1]); s = sp.read_text(encoding="utf-8")

if "model MemberGroup" in s:
    print("schéma déjà à jour"); 
else:
    # commentaire audience élargi
    C_OLD = '''  /// ALL_MEMBERS = diffusé à tous (nouveaux membres inclus d'office).
  /// SPECIFIC    = réservé aux membres listés dans `recipients` (perso = 1,
  /// bureau plus tard = N).
  audience DocumentAudience @default(ALL_MEMBERS)'''
    C_NEW = '''  /// ALL_MEMBERS = diffusé à tous (nouveaux membres inclus d'office).
  /// SPECIFIC    = ciblé : groupes (`groups`, appartenance résolue dynamiquement)
  /// ET/OU membres ad hoc (`recipients`). Un doc peut viser plusieurs groupes.
  audience DocumentAudience @default(ALL_MEMBERS)'''
    assert s.count(C_OLD) == 1, "ancre commentaire audience introuvable"
    s = s.replace(C_OLD, C_NEW)

    # relation groups sur MemberDocument
    D_OLD = '''  recipients MemberDocumentRecipient[]
  receipts   DocumentReceipt[]'''
    D_NEW = '''  recipients MemberDocumentRecipient[]
  groups     MemberDocumentGroup[]
  receipts   DocumentReceipt[]'''
    assert s.count(D_OLD) == 1, "ancre relations MemberDocument introuvable"
    s = s.replace(D_OLD, D_NEW)

    # relation sur User
    U_OLD = '''  documentReceipts          DocumentReceipt[]         @relation("DocumentReceiptUser")'''
    U_NEW = '''  documentReceipts          DocumentReceipt[]         @relation("DocumentReceiptUser")
  memberGroupMemberships    MemberGroupMembership[]   @relation("MemberGroupMembership")'''
    assert s.count(U_OLD) == 1, "ancre relation User introuvable"
    s = s.replace(U_OLD, U_NEW)

    MODELS = '''

/// Groupe de membres (ex. « Bureau »), géré dans le panneau de contrôle. Sert
/// de liste de diffusion : l'appartenance est résolue DYNAMIQUEMENT, donc un
/// membre ajouté hérite des documents déjà publiés au groupe.
model MemberGroup {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())

  memberships MemberGroupMembership[]
  documents   MemberDocumentGroup[]
}

/// Appartenance d'un membre à un groupe (un membre peut être dans plusieurs).
model MemberGroupMembership {
  id      String      @id @default(cuid())
  groupId String
  group   MemberGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  userId  String
  user    User        @relation("MemberGroupMembership", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
  @@index([userId])
}

/// Groupe visé par un MemberDocument ciblé. Un document peut en viser plusieurs.
model MemberDocumentGroup {
  id               String         @id @default(cuid())
  memberDocumentId String
  memberDocument   MemberDocument @relation(fields: [memberDocumentId], references: [id], onDelete: Cascade)
  groupId          String
  group            MemberGroup    @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([memberDocumentId, groupId])
  @@index([groupId])
}
'''
    s = s.rstrip() + "\n" + MODELS
    sp.write_text(s, encoding="utf-8")
    print("schéma patché (MemberGroup + Membership + DocumentGroup)")
PY

if [ ! -f "$MIG_DIR/migration.sql" ]; then
  mkdir -p "$MIG_DIR"
  cat > "$MIG_DIR/migration.sql" <<'SQL'
-- CreateTable
CREATE TABLE "MemberGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberGroupMembership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MemberGroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDocumentGroup" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "MemberDocumentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberGroupMembership_groupId_userId_key" ON "MemberGroupMembership"("groupId", "userId");
CREATE INDEX "MemberGroupMembership_userId_idx" ON "MemberGroupMembership"("userId");
CREATE UNIQUE INDEX "MemberDocumentGroup_memberDocumentId_groupId_key" ON "MemberDocumentGroup"("memberDocumentId", "groupId");
CREATE INDEX "MemberDocumentGroup_groupId_idx" ON "MemberDocumentGroup"("groupId");

-- AddForeignKey
ALTER TABLE "MemberGroupMembership" ADD CONSTRAINT "MemberGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MemberGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberGroupMembership" ADD CONSTRAINT "MemberGroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDocumentGroup" ADD CONSTRAINT "MemberDocumentGroup_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDocumentGroup" ADD CONSTRAINT "MemberDocumentGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MemberGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
SQL
  echo "migration SQL écrite : $MIG_DIR/migration.sql"
else
  echo "migration déjà présente"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de prisma generate, ni typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -8 /tmp/akfc_gen.log; exit 1; }
echo "✅ client régénéré"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification"; exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(groups): modèle MemberGroup + Membership + DocumentGroup (+ migration)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo ""
  echo "➡️  Applique la migration (voir le message pour les commandes local + serveur)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi