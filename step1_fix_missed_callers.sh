#!/usr/bin/env bash
###############################################################################
# ÉTAPE 1a — CORRECTIF (2 appelants manqués, révélés par le typecheck)
#
# S'applique PAR-DESSUS l'arbre où le script 1a a déjà tourné (edits présents
# mais non commités car le typecheck avait échoué). Ici on corrige les deux
# derniers points, puis generate -> typecheck -> commit capture 1a + fix.
#
#   1. cloudinary/router.ts : la procédure DÉPRÉCIÉE `createUploadSignatures`
#      appelle le service sans `userId` → on passe `ctx.user.id`.
#   2. r2StorageAdapter.ts  : le if/else présumait 2 kinds. Avec l'union
#      élargie, le `else` inclut `general`/`perso` (sans categoryId ni
#      proposedDisciplineName). On passe à un switch exhaustif qui REFUSE
#      explicitement general/perso pour R2 (hors périmètre de ce chantier :
#      photos Cloudinary d'abord, R2 perso reporté).
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="

test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

# Pré-requis : 1a doit être présent dans l'arbre.
if ! grep -q 'kind: z.literal("perso")' packages/contracts/src/cloudinary/upload.schema.ts 2>/dev/null; then
  echo "ERREUR: l'étape 1a n'est pas dans l'arbre (destination \`perso\` absente)."
  echo "        Lance d'abord step1a_decouple_upload_destination.sh."
  exit 1
fi

# Anti double-application.
if grep -q "ne sont pas supportées pour les uploads R2" packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts 2>/dev/null; then
  echo "Correctif déjà appliqué. Rien à faire."
  exit 0
fi

# --------------------------------------------------------------------------- #
# 1. cloudinary/router.ts — userId dans la procédure dépréciée                #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/router.ts"
s = open(p, encoding="utf-8").read()

a = '''      return createUploadSignatures({
        prisma: ctx.prisma,
        appRoot: PROJECT_ROOT,
        destination: input.destination,'''
b = '''      return createUploadSignatures({
        prisma: ctx.prisma,
        appRoot: PROJECT_ROOT,
        userId: ctx.user.id,
        destination: input.destination,'''
assert s.count(a) == 1, f"[1] cloudinary/router userId : {s.count(a)} match(es) (attendu 1)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [1] cloudinary/router.ts : userId passé à la procédure dépréciée OK")
PY

# --------------------------------------------------------------------------- #
# 2. r2StorageAdapter.ts — switch exhaustif (refuse general/perso)            #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
s = open(p, encoding="utf-8").read()

a = '''      if (input.destination.kind === "existing-discipline") {
        categoryId = input.destination.categoryId;
        disciplineId = input.destination.disciplineId;
      } else {
        // 'new-discipline'
        categoryId = input.destination.categoryId;
        proposedDisciplineName = input.destination.proposedDisciplineName;
      }'''

b = '''      switch (input.destination.kind) {
        case "existing-discipline":
          categoryId = input.destination.categoryId;
          disciplineId = input.destination.disciplineId;
          break;
        case "new-discipline":
          categoryId = input.destination.categoryId;
          proposedDisciplineName = input.destination.proposedDisciplineName;
          break;
        case "general":
        case "perso":
          // Destinations découplées non supportées pour R2 dans ce chantier
          // (photos Cloudinary d'abord ; R2 perso reporté). On refuse plutôt
          // que d'écrire une row bancale.
          throw new Error(
            "Les destinations 'general' et 'perso' ne sont pas supportées pour les uploads R2."
          );
        default:
          // Exhaustivité : un nouveau kind non traité fera échouer le build ici.
          input.destination satisfies never;
          throw new Error("Unhandled upload destination kind.");
      }'''

assert s.count(a) == 1, f"[2] r2 if/else block : {s.count(a)} match(es) (attendu 1)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [2] r2StorageAdapter.ts : switch exhaustif (general/perso refusés) OK")
PY

echo
echo "== Éditions appliquées =="

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."
  exit 0
fi

echo "== prisma generate =="
pnpm prisma generate
echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit (1a + correctif) =="
git add -A
git commit -m "feat(upload): decouple upload destination from discipline (general/perso), categoryId nullable"

echo
echo "###########################################################################"
echo "# RAPPEL — ÉTAPE DB MANUELLE (hors script) :                              #"
echo "#     pnpm prisma migrate deploy                                          #"
echo "# Nécessaire avant tout upload general/perso (categoryId NULL).           #"
echo "###########################################################################"