#!/usr/bin/env bash
#
# AKFC — Corbeille R2 — INCRÉMENT 3a (folder move) : trashToBin + restore.
#
# Un DOSSIER peut contenir du R2 imbriqué à toute profondeur. Les branches
# "folder" ne faisaient que le move Cloudinary (moveFolderRecursively) → les
# objets R2 restaient sur place. On ajoute r2MoveFolder à côté.
# Prérequis : incréments R2 1 (+2 pour trashToBin, +3 pour restore).
#
# Usage : bash apply-trash-r2-5a-folder-move.sh
#         AKFC_APPLY_ONLY=1 bash apply-trash-r2-5a-folder-move.sh   (clone)
#
set -euo pipefail
TB="packages/backend/src/modules/trash/services/trashToBin.service.ts"
RS="packages/backend/src/modules/trash/services/restoreFromBin.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
for f in "$TB" "$RS"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$TB" "$RS" <<'PY'
import sys, pathlib

IMPORT_OLD = ('  r2MoveFile,\n'
              '} from "@backend/modules/trash/services/r2TrashOps";\n')
IMPORT_NEW = ('  r2MoveFile,\n'
              '  r2MoveFolder,\n'
              '} from "@backend/modules/trash/services/r2TrashOps";\n')

# ── trashToBin ──
tb = pathlib.Path(sys.argv[1]); s = tb.read_text(encoding="utf-8")
if "r2MoveFolder" not in s:
    assert s.count(IMPORT_OLD) == 1, "TB: ancre import r2 (r2MoveFile)"
    s = s.replace(IMPORT_OLD, IMPORT_NEW, 1)
    a = '      await moveFolderRecursively(`${normalized}/`, `${storageRoot}/`);\n'
    assert s.count(a) == 1, "TB: ancre moveFolderRecursively"
    s = s.replace(a, a +
        '      // R2 : déplace aussi les objets R2 imbriqués (toute profondeur)\n'
        '      // que Cloudinary ignore — sinon ils resteraient dans le dossier vidé.\n'
        '      await r2MoveFolder(`${normalized}/`, `${storageRoot}/`);\n', 1)
    tb.write_text(s, encoding="utf-8"); print("trashToBin: r2MoveFolder ajouté")
else:
    print("trashToBin déjà à jour")

# ── restoreFromBin ──
rs = pathlib.Path(sys.argv[2]); t = rs.read_text(encoding="utf-8")
if "r2MoveFolder" not in t:
    assert t.count(IMPORT_OLD) == 1, "RS: ancre import r2 (r2MoveFile)"
    t = t.replace(IMPORT_OLD, IMPORT_NEW, 1)
    a = ('      await moveFolderRecursively(`${normalizePath(entry.storageRoot)}/`, '
         '`${normalizePath(restoredToPath)}/`);\n')
    assert t.count(a) == 1, "RS: ancre moveFolderRecursively"
    t = t.replace(a, a +
        '      // R2 : restaure aussi les objets R2 imbriqués (toute profondeur).\n'
        '      await r2MoveFolder(\n'
        '        `${normalizePath(entry.storageRoot)}/`,\n'
        '        `${normalizePath(restoredToPath)}/`,\n'
        '      );\n', 1)
    rs.write_text(t, encoding="utf-8"); print("restore: r2MoveFolder ajouté")
else:
    print("restore déjà à jour")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(trash): move dossier R2 à toute profondeur (trashToBin + restore) (incrément 3a)" && echo "commit $(git rev-parse --short HEAD)"