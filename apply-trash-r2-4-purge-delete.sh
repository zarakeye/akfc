#!/usr/bin/env bash
#
# AKFC — Chantier corbeille R2-aware — INCRÉMENT 4/5 : purge + deleteForever.
#
# Suppression DÉFINITIVE d'un fichier R2. Prérequis : incrément 1.
# Dans les deux services, la branche « Asset not found » (Cloudinary ne connaît
# pas l'objet) considérait l'asset « déjà parti » et NE supprimait rien → un
# binaire R2 restait sur R2. Fix : y tenter r2DeleteFile (idempotent : no-op si
# absent aussi sur R2). Édite deleteForever.service.ts ET purge.service.ts.
#
# Usage : bash apply-trash-r2-4-purge-delete.sh
#         AKFC_APPLY_ONLY=1 bash apply-trash-r2-4-purge-delete.sh   (clone)
#
set -euo pipefail
DF="packages/backend/src/modules/trash/services/deleteForever.service.ts"
PG="packages/backend/src/modules/trash/services/purge.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
for f in "$DF" "$PG"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$DF" "$PG" <<'PY'
import sys, pathlib

R2_IMPORT = 'import { r2DeleteFile } from "@backend/modules/trash/services/r2TrashOps";\n'

def edit(path, import_anchor, catch_old, catch_new, label):
    p = pathlib.Path(path); s = p.read_text(encoding="utf-8")
    if "r2DeleteFile" in s:
        print(f"déjà à jour: {label}"); return
    assert s.count(import_anchor) == 1, f"ancre import introuvable: {label}"
    s = s.replace(import_anchor, import_anchor + R2_IMPORT, 1)
    assert s.count(catch_old) == 1, f"ancre catch introuvable: {label}"
    s = s.replace(catch_old, catch_new, 1)
    p.write_text(s, encoding="utf-8")
    print(f"patché: {label}")

# --- deleteForever ---
edit(
    sys.argv[1],
    'import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";\n',
    '        if (message.startsWith("Asset not found")) {\n'
    '          console.warn(\n'
    '            `[deleteForever] Orphan TrashEntry (asset already gone): id=${entry.id} path=${entry.storageRoot}`,\n'
    '          );\n'
    '          // continue : on supprime la ligne DB ci-dessous\n'
    '        } else {\n'
    '          throw err;\n'
    '        }\n',
    '        if (message.startsWith("Asset not found")) {\n'
    '          // Cloudinary ne l\'a pas : peut-être un fichier R2 (PDF/docs).\n'
    '          // r2DeleteFile est idempotent (no-op si absent aussi sur R2).\n'
    '          await r2DeleteFile(entry.storageRoot);\n'
    '          console.warn(\n'
    '            `[deleteForever] Absent de Cloudinary; suppression R2 tentée (idempotent): id=${entry.id} path=${entry.storageRoot}`,\n'
    '          );\n'
    '        } else {\n'
    '          throw err;\n'
    '        }\n',
    "deleteForever",
)

# --- purge ---
edit(
    sys.argv[2],
    'import { pruneEmptyFolders } from "@backend/modules/cloudinary/services/pruneEmptyFolders.service";\n',
    '          if (!message.startsWith("Asset not found")) throw err;\n'
    '          console.warn(\n'
    '            `[purge] Orphan asset (already gone), keeping entry purge: id=${entry.id} path=${entry.storageRoot}`,\n'
    '          );\n',
    '          if (!message.startsWith("Asset not found")) throw err;\n'
    '          // Cloudinary ne l\'a pas : peut-être un fichier R2 (PDF/docs).\n'
    '          // r2DeleteFile est idempotent (no-op si absent aussi sur R2).\n'
    '          await r2DeleteFile(entry.storageRoot);\n'
    '          console.warn(\n'
    '            `[purge] Absent de Cloudinary; suppression R2 tentée (idempotent): id=${entry.id} path=${entry.storageRoot}`,\n'
    '          );\n',
    "purge",
)
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(trash): purge/deleteForever suppriment aussi les fichiers R2 (incrément 4/5)" && echo "commit $(git rev-parse --short HEAD)"