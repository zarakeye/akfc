#!/usr/bin/env bash
#
# AKFC — Sécurisation finder — INCRÉMENT 1b-bis : bouton corbeille (Finder.tsx).
#
# Désactive le bouton corbeille de la barre multi-sélection quand la sélection
# contient un dossier-entité protégé (groupe/perso/avatars). Complète 1b (menus).
# Le gate backend (1a) reste la vraie protection.
#
# Usage : bash apply-finder-protect-1b2-button.sh
#
set -euo pipefail
F="apps/web/src/features/finder-core/components/Finder.tsx"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
[ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isProtectedEntityFolder" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

# 1) import du prédicat (après le dernier import, selectionNodes)
s = sub(
'import {\n'
'  buildNodePool,\n'
'  resolveSelectedNodes,\n'
'} from "@features/finder-core/utils/selectionNodes";\n',
'import {\n'
'  buildNodePool,\n'
'  resolveSelectedNodes,\n'
'} from "@features/finder-core/utils/selectionNodes";\n'
'import { isProtectedEntityFolder } from "@features/finder-core/utils/spaceFolderKind";\n',
"import isProtectedEntityFolder")

# 2) canDelete exclut les dossiers-entités protégés
s = sub(
'          const canDelete = selectedCount > 0;\n'
'          const deleteButtonLabel = canDelete\n'
'            ? deleteLabel(selectedCount, selectedNodes)\n'
'            : "Supprimer";\n',
'          const hasProtectedEntity = selectedNodes.some(\n'
'            (n) => n.type === "folder" && isProtectedEntityFolder(n.path),\n'
'          );\n'
'          const canDelete = selectedCount > 0 && !hasProtectedEntity;\n'
'          const deleteButtonLabel = canDelete\n'
'            ? deleteLabel(selectedCount, selectedNodes)\n'
'            : "Supprimer";\n',
"canDelete")

# 3) title : message dédié quand un dossier-entité est sélectionné
s = sub(
'              title={\n'
'                canDelete\n'
'                  ? deleteButtonLabel\n'
'                  : "Sélectionne un contenu ou un dossier"\n'
'              }\n',
'              title={\n'
'                canDelete\n'
'                  ? deleteButtonLabel\n'
'                  : hasProtectedEntity\n'
'                  ? "Un dossier d\'entité (groupe, espace perso, avatars) ne se supprime pas ici"\n'
'                  : "Sélectionne un contenu ou un dossier"\n'
'              }\n',
"title")

p.write_text(s, encoding="utf-8")
print("bouton corbeille sécurisé (Finder.tsx)")
PY

echo "typecheck web…"
pnpm --filter web typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(finder): désactive le bouton corbeille sur sélection contenant un dossier-entité (incrément 1b-bis)" && echo "commit $(git rev-parse --short HEAD)"