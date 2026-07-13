#!/usr/bin/env bash
###############################################################################
# G1 — Supporter la destination `general` pour les uploads R2
#
# « Comme la biblio » inclut les fichiers R2 (audio/docs/zip). Or `general`
# était rejeté par l'adaptateur R2 (correctif 1a). On l'active :
#
#   1. r2UploadDestinationSchema (storage/router.ts) : +`general` (union
#      3-kinds : existing / new / general). PAS `perso` (R2 perso reporté).
#   2. r2StorageAdapter.ts : le switch gère `general` (categoryId reste null) ;
#      seul `perso` reste refusé. `categoryId` devient `number | null`.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

ADAPTER="packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"

if grep -q "La destination 'perso' n'est pas supportée pour les uploads R2" "$ADAPTER" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. r2UploadDestinationSchema : +general                                     #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/router.ts"
s = open(p, encoding="utf-8").read()

a = '''  z.object({
    kind: z.literal('new-discipline'),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().min(1).max(120),
  }),
]);'''
b = '''  z.object({
    kind: z.literal('new-discipline'),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().min(1).max(120),
  }),
  // Espace club partagé, sans discipline ni catégorie.
  z.object({
    kind: z.literal('general'),
  }),
]);'''
assert s.count(a) == 1, f"[1] r2UploadDestinationSchema : {s.count(a)} match(es)."
s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s)
print("  [1] router.ts : r2UploadDestinationSchema + general OK")
PY

# --------------------------------------------------------------------------- #
# 2. r2StorageAdapter : gère general (categoryId null), perso reste rejeté     #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
s = open(p, encoding="utf-8").read()

a = '''      let categoryId: number;
      let disciplineId: number | null = null;
      let proposedDisciplineName: string | null = null;

      switch (input.destination.kind) {
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

b = '''      let categoryId: number | null = null;
      let disciplineId: number | null = null;
      let proposedDisciplineName: string | null = null;

      switch (input.destination.kind) {
        case "existing-discipline":
          categoryId = input.destination.categoryId;
          disciplineId = input.destination.disciplineId;
          break;
        case "new-discipline":
          categoryId = input.destination.categoryId;
          proposedDisciplineName = input.destination.proposedDisciplineName;
          break;
        case "general":
          // Espace club partagé, sans discipline ni catégorie
          // (categoryId reste null).
          break;
        case "perso":
          // R2 perso toujours reporté (photos Cloudinary d'abord).
          throw new Error(
            "La destination 'perso' n'est pas supportée pour les uploads R2.",
          );
        default:
          // Exhaustivité : un nouveau kind non traité fera échouer le build ici.
          input.destination satisfies never;
          throw new Error("Unhandled upload destination kind.");
      }'''

assert s.count(a) == 1, f"[2] switch R2 : {s.count(a)} match(es)."
s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s)
print("  [2] r2StorageAdapter.ts : general géré, perso rejeté OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== prisma generate =="
pnpm prisma generate
echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(upload): support general destination for R2 uploads"
echo "OK — G1 commité."