#!/usr/bin/env bash
#
# AKFC — Chantier corbeille R2-aware — INCRÉMENT 3/5 : restoreFromBin (fichiers).
# (L'ancien "incrément 3 readTrashFolder" est SAUTÉ pour le cas fichier :
#  listBin est DB-only, un fichier jeté apparaît déjà dans la corbeille.)
#
# Rend la RESTAURATION d'un fichier R2 possible. Prérequis : incréments 1 + 2.
# Détection du backend via fileExists (Cloudinary, sans throw) : si Cloudinary
# ne connaît pas l'objet mais R2 oui → r2MoveFile(storageRoot → restoredToPath) ;
# sinon flux Cloudinary inchangé. Cas DOSSIER R2 non couvert (ultérieur).
#
# Usage : bash apply-trash-r2-3-restore.sh
#         AKFC_APPLY_ONLY=1 bash apply-trash-r2-3-restore.sh   (clone)
#
set -euo pipefail
F="packages/backend/src/modules/trash/services/restoreFromBin.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "r2MoveFile" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

# 1) import r2TrashOps
s = sub(
'import { pruneEmptyFolders } from "@backend/modules/cloudinary/services/pruneEmptyFolders.service";\n',
'import { pruneEmptyFolders } from "@backend/modules/cloudinary/services/pruneEmptyFolders.service";\n'
'import {\n'
'  r2Exists,\n'
'  r2MoveFile,\n'
'} from "@backend/modules/trash/services/r2TrashOps";\n',
"import r2TrashOps")

# 2) bloc restore fichier : backend-aware
s = sub(
'    // Move Cloudinary\n'
'    if (kind === "file") {\n'
'      const info = await getAssetInfo(entry.storageRoot);\n'
'      await renameAsset(entry.storageRoot, restoredToPath, info.resource_type);\n'
'    } else {\n',
'    // Move physique (Cloudinary ou R2)\n'
'    if (kind === "file") {\n'
'      // Détecte le backend : Cloudinary d\'abord (fileExists, sans throw),\n'
'      // sinon R2 (PDF/documents).\n'
'      const onCloudinary = await fileExists(entry.storageRoot);\n'
'      if (!onCloudinary && (await r2Exists(entry.storageRoot))) {\n'
'        await r2MoveFile(entry.storageRoot, restoredToPath);\n'
'      } else {\n'
'        const info = await getAssetInfo(entry.storageRoot);\n'
'        await renameAsset(entry.storageRoot, restoredToPath, info.resource_type);\n'
'      }\n'
'    } else {\n',
"restore fichier R2")

p.write_text(s, encoding="utf-8")
print("restoreFromBin R2-aware (fichiers) appliqué")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(trash): restaurer les fichiers R2 depuis la corbeille (incrément 3/5)" && echo "commit $(git rev-parse --short HEAD)"