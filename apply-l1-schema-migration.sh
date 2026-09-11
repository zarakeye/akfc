#!/usr/bin/env bash
#
# AKFC — Refactor Stage → Seminar, LOT L1 : schéma Prisma + migration.
#
# Crée la branche, renomme les modèles/champs/relations dans schema.prisma
# (Stage→Seminar, StageSession→SeminarSession, stageId→seminarId, relations),
# et place la migration `ALTER RENAME` déjà validée en transaction.
#
# ⚠️ APRÈS L1, le CODE dit encore `Stage` → le typecheck ÉCHOUE volontairement.
#    C'est la méthode : on renomme la SOURCE (schéma+client), puis le compilateur
#    liste chaque référence à corriger (L2). Donc L1 NE committe PAS.
#
# Étapes après ce script :
#   pnpm prisma generate            # client → Seminar/prisma.seminar/seminarId
#   pnpm check 2>&1 | tee /tmp/tc.log   # liste TOUTES les références cassées
#   → colle-moi /tmp/tc.log, je livre L2 (backend/contracts/front) ciblé.
#
# NE PAS `migrate deploy` maintenant : on applique la migration quand tout le
# lot est vert (sinon DB=Seminar / code=Stage = incohérent en dev).
#
# Usage : bash apply-L1-schema-migration.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
SCHEMA="prisma/schema.prisma"
[ -f "$SCHEMA" ] || { echo "ERREUR: $SCHEMA introuvable." >&2; exit 1; }

# branche dédiée
CUR="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
if [ "$CUR" != "refactor/stage-to-seminar" ]; then
  if git show-ref --verify --quiet refs/heads/refactor/stage-to-seminar; then
    git checkout refactor/stage-to-seminar
  else
    git checkout -b refactor/stage-to-seminar
  fi
fi
echo "→ branche : $(git rev-parse --abbrev-ref HEAD)"

if grep -q 'model Seminar {' "$SCHEMA" 2>/dev/null; then echo "— schéma déjà renommé"; exit 0; fi

python3 - "$SCHEMA" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

def sub(old, new, n=1):
    global s
    c = s.count(old)
    assert c == n, f"ancre attendue {n}× trouvée {c}× : {old[:60]!r}"
    s = s.replace(old, new)

sub("model Stage {", "model Seminar {")
sub("model StageSession {", "model SeminarSession {")
sub("  sessions StageSession[]", "  sessions SeminarSession[]")
sub('@relation("StagePrimaryAnimator", fields: [primaryAnimatorId]',
    '@relation("SeminarPrimaryAnimator", fields: [primaryAnimatorId]')
sub('animators User[] @relation("StageAnimators")',
    'animators User[] @relation("SeminarAnimators")')
# StageSession → champ + relation + contraintes
sub("\n  stageId Int\n", "\n  seminarId Int\n")
sub("stage Stage @relation(fields: [stageId], references: [id], onDelete: Cascade)",
    "seminar Seminar @relation(fields: [seminarId], references: [id], onDelete: Cascade)")
sub("@@unique([stageId, date, beginTime])", "@@unique([seminarId, date, beginTime])")
sub("@@index([stageId])", "@@index([seminarId])")
# User (relations inverses)
sub('stagesAsPrimaryAnimator   Stage[]       @relation("StagePrimaryAnimator")',
    'seminarsAsPrimaryAnimator Seminar[]     @relation("SeminarPrimaryAnimator")')
sub('stagesAsAnimator          Stage[]       @relation("StageAnimators")',
    'seminarsAsAnimator        Seminar[]     @relation("SeminarAnimators")')
# Discipline + Origin (identiques → 2×)
sub("  stages Stage[]", "  seminars Seminar[]", 2)
# Gallery (champ + relation)
sub("stageId      Int?", "seminarId    Int?")
sub("stage        Stage?      @relation(fields: [stageId], references: [id])",
    "seminar      Seminar?    @relation(fields: [seminarId], references: [id])")

p.write_text(s, encoding="utf-8")
print("schema.prisma renommé (structure ; commentaires FR laissés tels quels).")
PY

# migration (le SQL validé, sans BEGIN/ROLLBACK — migrate deploy transactionne)
MIG="prisma/migrations/20261111000000_rename_stage_to_seminar"
mkdir -p "$MIG"
cat > "$MIG/migration.sql" <<'SQL'
-- Renommage Stage → Seminar (métadonnée pure ; validé en transaction au préalable).
ALTER TABLE "Stage" RENAME TO "Seminar";
ALTER TABLE "StageSession" RENAME TO "SeminarSession";
ALTER TABLE "_StageAnimators" RENAME TO "_SeminarAnimators";
ALTER TABLE "SeminarSession" RENAME COLUMN "stageId" TO "seminarId";
ALTER TABLE "Gallery" RENAME COLUMN "stageId" TO "seminarId";
ALTER SEQUENCE "Stage_id_seq" RENAME TO "Seminar_id_seq";
ALTER SEQUENCE "StageSession_id_seq" RENAME TO "SeminarSession_id_seq";
ALTER TABLE "Seminar" RENAME CONSTRAINT "Stage_disciplineId_fkey" TO "Seminar_disciplineId_fkey";
ALTER TABLE "Seminar" RENAME CONSTRAINT "Stage_originId_fkey" TO "Seminar_originId_fkey";
ALTER TABLE "Seminar" RENAME CONSTRAINT "Stage_primaryAnimatorId_fkey" TO "Seminar_primaryAnimatorId_fkey";
ALTER TABLE "SeminarSession" RENAME CONSTRAINT "StageSession_stageId_fkey" TO "SeminarSession_seminarId_fkey";
ALTER TABLE "Gallery" RENAME CONSTRAINT "Gallery_stageId_fkey" TO "Gallery_seminarId_fkey";
ALTER TABLE "_SeminarAnimators" RENAME CONSTRAINT "_StageAnimators_A_fkey" TO "_SeminarAnimators_A_fkey";
ALTER TABLE "_SeminarAnimators" RENAME CONSTRAINT "_StageAnimators_B_fkey" TO "_SeminarAnimators_B_fkey";
ALTER INDEX "Stage_pkey" RENAME TO "Seminar_pkey";
ALTER INDEX "Stage_slug_key" RENAME TO "Seminar_slug_key";
ALTER INDEX "Stage_disciplineId_label_key" RENAME TO "Seminar_disciplineId_label_key";
ALTER INDEX "StageSession_pkey" RENAME TO "SeminarSession_pkey";
ALTER INDEX "StageSession_stageId_date_beginTime_key" RENAME TO "SeminarSession_seminarId_date_beginTime_key";
ALTER INDEX "_StageAnimators_AB_pkey" RENAME TO "_SeminarAnimators_AB_pkey";
ALTER INDEX "Stage_disciplineId_idx" RENAME TO "Seminar_disciplineId_idx";
ALTER INDEX "Stage_originId_idx" RENAME TO "Seminar_originId_idx";
ALTER INDEX "Stage_primaryAnimatorId_idx" RENAME TO "Seminar_primaryAnimatorId_idx";
ALTER INDEX "Stage_publicationDate_idx" RENAME TO "Seminar_publicationDate_idx";
ALTER INDEX "StageSession_date_idx" RENAME TO "SeminarSession_date_idx";
ALTER INDEX "StageSession_stageId_idx" RENAME TO "SeminarSession_seminarId_idx";
ALTER INDEX "_StageAnimators_B_index" RENAME TO "_SeminarAnimators_B_index";
SQL
echo "→ migration écrite : $MIG/migration.sql"

echo ""
echo "════════ L1 fait (schéma + migration). PAS de commit — normal. ════════"
echo "Suite :"
echo "  pnpm prisma generate"
echo "  pnpm check 2>&1 | tee /tmp/tc.log"
echo "  → colle-moi /tmp/tc.log ; je livre L2 (backend/contracts/front) ciblé."