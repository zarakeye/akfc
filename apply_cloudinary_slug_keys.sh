#!/usr/bin/env bash
#
# AKFC — Slugifier la clé Cloudinary à l'upload (increment 1/2 : backend).
#
# Aujourd'hui `createUploadSignatures` dérive le public_id du nom BRUT
# (`fileName.replace(ext)`), alors que R2 passe déjà par `buildUploadFileName`
# (slugifié). D'où l'asymétrie : clés R2 propres, public_id Cloudinary bruts
# (points, espaces, parenthèses) → toute la classe de bugs livraison/renommage.
#
# Ce patch fait passer Cloudinary par la MÊME `buildUploadFileName` : les deux
# providers produisent des clés identiques et sûres. Un slug n'ayant aucun
# point, la troncature `<public_id>.<format>` disparaît à la source pour tout
# nouvel asset — sans dépendre du passage de `format`. Le nom humain reste
# intact dans `originalFileName` / `displayName` (affichage : increment 2).
#
# Increment 2 (à part) : brancher l'affichage du finder sur
# `displayName`/`originalFileName` plutôt que sur la clé slugifiée.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-cloudinary-slug-keys.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-cloudinary-slug-keys.sh
#
set -euo pipefail

SVC="packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "buildUploadFileName" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── 1) Import de buildUploadFileName ────────────────────────────────────────
IMP_OLD = r'''import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";'''
IMP_NEW = r'''import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";
import { buildUploadFileName } from "@backend/modules/storage/services/buildUploadFileName.service";'''
assert s.count(IMP_OLD) == 1, "ancre import introuvable/multiple — abandon avant tout commit"
s = s.replace(IMP_OLD, IMP_NEW)

# ── 2) Détection de conflit : slugifier la base (helper + fullPublicIdFor) ──
A_OLD = r'''  const fullPublicIdFor = (fileName: string) =>
    `${folder}/${fileName.replace(/\.[^/.]+$/, "")}`;'''
A_NEW = r'''  // Base slugifiée — même règle que R2 (`buildUploadFileName`), donc clés
  // Cloudinary et R2 identiques et SÛRES (ni point, ni espace, ni parenthèse).
  // Retire à la source la classe de bugs livraison/renommage. Le nom humain
  // reste dans `originalFileName` / `displayName`, lus à l'affichage.
  const safeBaseName = (fileName: string) =>
    buildUploadFileName(fileName).replace(/\.[^/.]+$/, "");
  const fullPublicIdFor = (fileName: string) =>
    `${folder}/${safeBaseName(fileName)}`;'''
assert s.count(A_OLD) == 1, "ancre fullPublicIdFor introuvable/multiple — abandon avant tout commit"
s = s.replace(A_OLD, A_NEW)

# ── 3) publicId de chaque asset : réutiliser le helper ──────────────────────
B_OLD = r'''    const publicId = asset.fileName.replace(/\.[^/.]+$/, "");'''
B_NEW = r'''    const publicId = safeBaseName(asset.fileName);'''
assert s.count(B_OLD) == 1, "ancre publicId introuvable/multiple — abandon avant tout commit"
s = s.replace(B_OLD, B_NEW)

p.write_text(s, encoding="utf-8")
print("patch createUploadSignatures OK (slugification via buildUploadFileName)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(upload): slugifier le public_id Cloudinary via buildUploadFileName (clés sûres, parité R2, fin des bugs de noms pointés)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi