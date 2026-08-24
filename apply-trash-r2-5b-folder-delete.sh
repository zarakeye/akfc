#!/usr/bin/env bash
#
# AKFC — Corbeille R2 — INCRÉMENT 3b (folder delete) : purge + deleteForever.
#
# Les branches "folder" suppriment via deleteByPrefix (Cloudinary) → les objets
# R2 imbriqués n'étaient jamais supprimés. On ajoute r2DeleteByPrefix à côté,
# après CHAQUE deleteByPrefix qui purge du contenu de corbeille (storageRoot,
# et wrapper pour purge). Prérequis : incréments R2 1 + 4.
#
# Usage : bash apply-trash-r2-5b-folder-delete.sh
#         AKFC_APPLY_ONLY=1 bash apply-trash-r2-5b-folder-delete.sh   (clone)
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

IMPORT_OLD = 'import { r2DeleteFile } from "@backend/modules/trash/services/r2TrashOps";\n'
IMPORT_NEW = ('import {\n'
              '  r2DeleteFile,\n'
              '  r2DeleteByPrefix,\n'
              '} from "@backend/modules/trash/services/r2TrashOps";\n')

# ── deleteForever ──
df = pathlib.Path(sys.argv[1]); s = df.read_text(encoding="utf-8")
if "r2DeleteByPrefix" not in s:
    assert s.count(IMPORT_OLD) == 1, "DF: import r2DeleteFile"
    s = s.replace(IMPORT_OLD, IMPORT_NEW, 1)
    a = '      await deleteByPrefix(`${normalizePath(entry.storageRoot)}/`);\n'
    assert s.count(a) == 1, "DF: deleteByPrefix storageRoot"
    s = s.replace(a, a +
        '      // R2 : supprime aussi les objets R2 imbriqués (toute profondeur).\n'
        '      await r2DeleteByPrefix(`${normalizePath(entry.storageRoot)}/`);\n', 1)
    df.write_text(s, encoding="utf-8"); print("deleteForever: r2DeleteByPrefix ajouté")
else:
    print("deleteForever déjà à jour")

# ── purge ──
pg = pathlib.Path(sys.argv[2]); t = pg.read_text(encoding="utf-8")
if "r2DeleteByPrefix" not in t:
    assert t.count(IMPORT_OLD) == 1, "PG: import r2DeleteFile"
    t = t.replace(IMPORT_OLD, IMPORT_NEW, 1)
    # folder branch (8 espaces)
    a1 = '        await deleteByPrefix(`${normalizePath(entry.storageRoot)}/`);\n'
    assert t.count(a1) == 1, "PG: deleteByPrefix storageRoot"
    t = t.replace(a1, a1 +
        '        // R2 : supprime aussi les objets R2 imbriqués (toute profondeur).\n'
        '        await r2DeleteByPrefix(`${normalizePath(entry.storageRoot)}/`);\n', 1)
    # wrapper cleanup (6 espaces)
    a2 = '      await deleteByPrefix(`${normalizePath(wrapperPath)}/`);\n'
    assert t.count(a2) == 1, "PG: deleteByPrefix wrapperPath"
    t = t.replace(a2, a2 +
        '      // R2 : idem sur le wrapper de corbeille.\n'
        '      await r2DeleteByPrefix(`${normalizePath(wrapperPath)}/`);\n', 1)
    pg.write_text(t, encoding="utf-8"); print("purge: r2DeleteByPrefix ajouté (×2)")
else:
    print("purge déjà à jour")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(trash): delete dossier R2 à toute profondeur (purge + deleteForever) (incrément 3b)" && echo "commit $(git rev-parse --short HEAD)"