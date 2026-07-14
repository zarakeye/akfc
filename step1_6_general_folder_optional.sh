#!/usr/bin/env bash
###############################################################################
# G1.6 — Le sous-dossier de `general` devient OPTIONNEL
#
# Sans sous-dossier → dépôt directement à la racine de `general/`.
# Requiert G1.5 appliqué.
#
#   1. contracts/upload.schema.ts : general.folder → .optional()
#   2. storage/router.ts (r2)     : general.folder → .optional()
#   3. resolvePendingUploadFolder : folder absent → `${appRoot}/pending/general`
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

if ! grep -q "listGeneralFolders" packages/backend/src/modules/storage/router.ts 2>/dev/null; then
  echo "ERREUR: G1.5 absent. Applique stepG1_5_general_folder.sh d'abord."; exit 1
fi

if grep -q "if (!destination.folder)" packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. contracts                                                                #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/contracts/src/cloudinary/upload.schema.ts"
s = open(p, encoding="utf-8").read()
a = '''    kind: z.literal("general"),
    // Sous-dossier nommé sous `general/` (existant ou créé à la volée).
    folder: z.string().trim().min(1).max(120),'''
b = '''    kind: z.literal("general"),
    // Sous-dossier OPTIONNEL sous `general/` (existant ou créé à la volée).
    // Absent → dépôt à la racine de `general/`.
    folder: z.string().trim().min(1).max(120).optional(),'''
assert s.count(a) == 1, f"[1] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [1] upload.schema.ts : general.folder optional OK")
PY

# --------------------------------------------------------------------------- #
# 2. router (r2)                                                              #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/router.ts"
s = open(p, encoding="utf-8").read()
a = '''    kind: z.literal('general'),
    folder: z.string().trim().min(1).max(120),
  }),'''
b = '''    kind: z.literal('general'),
    folder: z.string().trim().min(1).max(120).optional(),
  }),'''
assert s.count(a) == 1, f"[2] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [2] router.ts : r2 general.folder optional OK")
PY

# --------------------------------------------------------------------------- #
# 3. resolvePendingUploadFolder                                              #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
s = open(p, encoding="utf-8").read()
a = '''  if (destination.kind === "general") {
    const folderSlug = slug(destination.folder);'''
b = '''  if (destination.kind === "general") {
    // Pas de sous-dossier → dépôt à la racine de `general/`.
    if (!destination.folder) {
      return `${appRoot}/pending/general`;
    }
    const folderSlug = slug(destination.folder);'''
assert s.count(a) == 1, f"[3] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [3] resolvePendingUploadFolder.ts : root general si pas de folder OK")
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
git commit -m "feat(upload): make general subfolder optional (allow uploading to general root)"
echo "OK — G1.6 commité."