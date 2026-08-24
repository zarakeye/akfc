#!/usr/bin/env bash
#
# AKFC — Corbeille R2 — INCRÉMENT 3c (readTrashFolder) : voir le R2 imbriqué.
#
# En naviguant DANS un dossier jeté, readTrashFolder ne listait que les assets
# Cloudinary (listAssetsByPrefix) → les fichiers R2 imbriqués étaient invisibles.
# On liste aussi les objets R2 (r2ListByPrefix) et on les fusionne comme des
# ListedAsset "raw". Prérequis : incrément R2 1.
#
# Usage : bash apply-trash-r2-5c-readtrash.sh
#         AKFC_APPLY_ONLY=1 bash apply-trash-r2-5c-readtrash.sh   (clone)
#
set -euo pipefail
F="packages/backend/src/modules/trash/services/readTrashFolder.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "r2ListByPrefix" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

# import r2ListByPrefix (après le bloc mediaKind.utils)
s = sub(
'import {\n'
'  mediaKindFromCloudinaryResourceType,\n'
'  type CloudinaryResourceType,\n'
'} from "@backend/modules/cloudinary/utils/mediaKind.utils";\n',
'import {\n'
'  mediaKindFromCloudinaryResourceType,\n'
'  type CloudinaryResourceType,\n'
'} from "@backend/modules/cloudinary/utils/mediaKind.utils";\n'
'import { r2ListByPrefix } from "@backend/modules/trash/services/r2TrashOps";\n',
"import r2ListByPrefix")

# fusion R2 avant computeDirectChildren
s = sub(
'  const assets = await listAssetsByPrefix(storagePrefix);\n',
'  const cloudinaryAssets = await listAssetsByPrefix(storagePrefix);\n'
'  // R2 : les objets R2 imbriqués (documents) sont invisibles de l\'API\n'
'  // Cloudinary — on les liste et les fusionne (resourceType "raw").\n'
'  const r2Objects = await r2ListByPrefix(\n'
'    storagePrefix.endsWith("/") ? storagePrefix : `${storagePrefix}/`,\n'
'  );\n'
'  const r2Assets: ListedAsset[] = r2Objects.map((o) => ({\n'
'    publicId: o.key,\n'
'    bytes: o.bytes,\n'
'    createdAt: o.createdAt ? o.createdAt.toISOString() : undefined,\n'
'    resourceType: "raw" as const,\n'
'  }));\n'
'  const assets = [...cloudinaryAssets, ...r2Assets];\n',
"fusion R2")

p.write_text(s, encoding="utf-8")
print("readTrashFolder R2-aware")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(trash): readTrashFolder liste aussi le R2 imbriqué (incrément 3c)" && echo "commit $(git rev-parse --short HEAD)"